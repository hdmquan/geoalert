import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { preprocessData, fetchData } from "../fetcher.js";
import * as geocoder from "../geocoder.js";
import * as db from "../database.js";

jest.mock("../geocoder.js");
jest.mock("../database.js");
