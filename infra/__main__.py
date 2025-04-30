import pulumi
import pulumi_aws as aws

# Configs
config = pulumi.Config()
region = aws.config.region

# VPC (single AZ, free tier friendly)
vpc = aws.ec2.Vpc(
    "simple-vpc",
    cidr_block="10.0.0.0/16",
    enable_dns_support=True,
    enable_dns_hostnames=True,
)

# Public Subnet (for EC2 + ECS)
public_subnet = aws.ec2.Subnet(
    "public-subnet",
    vpc_id=vpc.id,
    cidr_block="10.0.1.0/24",
    map_public_ip_on_launch=True,
    availability_zone=f"{region}a",
)

# Internet Gateway
igw = aws.ec2.InternetGateway("igw", vpc_id=vpc.id)

# Route Table for Internet Access
route_table = aws.ec2.RouteTable(
    "route-table",
    vpc_id=vpc.id,
    routes=[{"cidr_block": "0.0.0.0/0", "gateway_id": igw.id}],
)

aws.ec2.RouteTableAssociation(
    "rt-assoc", subnet_id=public_subnet.id, route_table_id=route_table.id
)

# Security Group
web_sg = aws.ec2.SecurityGroup(
    "web-sg",
    vpc_id=vpc.id,
    description="Allow web access",
    ingress=[
        {
            "protocol": "tcp",
            "from_port": 5173,
            "to_port": 5173,
            "cidr_blocks": ["0.0.0.0/0"],
        },
        {
            "protocol": "tcp",
            "from_port": 5001,
            "to_port": 5001,
            "cidr_blocks": ["0.0.0.0/0"],
        },
        {
            "protocol": "tcp",
            "from_port": 22,
            "to_port": 22,
            "cidr_blocks": ["0.0.0.0/0"],
        },
    ],
    egress=[
        {"protocol": "-1", "from_port": 0, "to_port": 0, "cidr_blocks": ["0.0.0.0/0"]}
    ],
)

# ECS Cluster
ecs_cluster = aws.ecs.Cluster("simple-cluster")

# IAM Role for ECS Execution
ecs_task_exec_role = aws.iam.Role(
    "ecsTaskExecutionRole",
    assume_role_policy=aws.iam.get_policy_document(
        statements=[
            {
                "effect": "Allow",
                "principals": [
                    {"type": "Service", "identifiers": ["ecs-tasks.amazonaws.com"]}
                ],
                "actions": ["sts:AssumeRole"],
            }
        ]
    ).json,
)

aws.iam.RolePolicyAttachment(
    "ecs-task-exec-policy",
    role=ecs_task_exec_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
)

# ECR for backend and frontend images
frontend_repo = aws.ecr.Repository("frontend-repo")
backend_repo = aws.ecr.Repository("backend-repo")

# S3 Bucket for init SQL
init_sql_bucket = aws.s3.Bucket("init-sql-bucket")

# RDS Postgres (single AZ, free tier eligible)
db = aws.rds.Instance(
    "geoalert-db",
    allocated_storage=20,
    engine="postgres",
    engine_version="15.3",
    instance_class="db.t3.micro",
    db_name="geoalert",
    username="postgres",
    password="postgres",
    publicly_accessible=False,
    vpc_security_group_ids=[web_sg.id],
    skip_final_snapshot=True,
    db_subnet_group_name=None,
)

# ElastiCache Redis (single node, cheapest config)
redis = aws.elasticache.Cluster(
    "redis-cluster",
    engine="redis",
    node_type="cache.t4g.micro",
    num_cache_nodes=1,
    security_group_ids=[web_sg.id],
    parameter_group_name="default.redis7",
)

pulumi.export("vpc_id", vpc.id)
pulumi.export("public_subnet_id", public_subnet.id)
pulumi.export("db_endpoint", db.endpoint)
pulumi.export("redis_endpoint", redis.cache_nodes[0]["address"])
pulumi.export("frontend_repo_url", frontend_repo.repository_url)
pulumi.export("backend_repo_url", backend_repo.repository_url)
pulumi.export("init_sql_bucket", init_sql_bucket.bucket)
