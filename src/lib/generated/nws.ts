import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";




const StateTerritoryCode = z.enum(["AL", "AK", "AS", "AR", "AZ", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY", "MP", "PW", "FM", "MH"]);
const MarineAreaCode = z.enum(["AM", "AN", "GM", "LC", "LE", "LH", "LM", "LO", "LS", "PH", "PK", "PM", "PS", "PZ", "SL"]);
const AreaCode = z.union([StateTerritoryCode, MarineAreaCode]);
const MarineRegionCode = z.enum(["AL", "AT", "GL", "GM", "PA", "PI"]);
const NWSZoneID = z.string();
const AlertUrgency = z.enum(["Immediate", "Expected", "Future", "Past", "Unknown"]);
const AlertSeverity = z.enum(["Extreme", "Severe", "Moderate", "Minor", "Unknown"]);
const AlertCertainty = z.enum(["Observed", "Likely", "Possible", "Unlikely", "Unknown"]);
const area = z.union([StateTerritoryCode, MarineAreaCode]);
const NWSForecastOfficeId = z.enum(["AKQ", "ALY", "BGM", "BOX", "BTV", "BUF", "CAE", "CAR", "CHS", "CLE", "CTP", "GSP", "GYX", "ILM", "ILN", "LWX", "MHX", "OKX", "PBZ", "PHI", "RAH", "RLX", "RNK", "ABQ", "AMA", "BMX", "BRO", "CRP", "EPZ", "EWX", "FFC", "FWD", "HGX", "HUN", "JAN", "JAX", "KEY", "LCH", "LIX", "LUB", "LZK", "MAF", "MEG", "MFL", "MLB", "MOB", "MRX", "OHX", "OUN", "SHV", "SJT", "SJU", "TAE", "TBW", "TSA", "ABR", "APX", "ARX", "BIS", "BOU", "CYS", "DDC", "DLH", "DMX", "DTX", "DVN", "EAX", "FGF", "FSD", "GID", "GJT", "GLD", "GRB", "GRR", "ICT", "ILX", "IND", "IWX", "JKL", "LBF", "LMK", "LOT", "LSX", "MKX", "MPX", "MQT", "OAX", "PAH", "PUB", "RIW", "SGF", "TOP", "UNR", "BOI", "BYZ", "EKA", "FGZ", "GGW", "HNX", "LKN", "LOX", "MFR", "MSO", "MTR", "OTX", "PDT", "PIH", "PQR", "PSR", "REV", "SEW", "SGX", "SLC", "STO", "TFX", "TWC", "VEF", "AER", "AFC", "AFG", "AJK", "ALU", "GUM", "HPA", "HFO", "PPG", "STU", "NH1", "NH2", "ONA", "ONP"]);
const NWSRegionalHQId = z.enum(["ARH", "CRH", "ERH", "PRH", "SRH", "WRH"]);
const NWSNationalHQId = z.literal("NWS");
const officeId = z.union([NWSForecastOfficeId, NWSRegionalHQId, NWSNationalHQId]);
const arrived = z.union([z.string(), z.string(), z.string()]).optional();
const LandRegionCode = z.enum(["AR", "CR", "ER", "PR", "SR", "WR"]);
const RegionCode = z.union([LandRegionCode, MarineRegionCode]);
const NWSZoneType = z.enum(["land", "marine", "forecast", "public", "coastal", "offshore", "fire", "county"]);

export const schemas = {
	StateTerritoryCode,
	MarineAreaCode,
	AreaCode,
	MarineRegionCode,
	NWSZoneID,
	AlertUrgency,
	AlertSeverity,
	AlertCertainty,
	area,
	NWSForecastOfficeId,
	NWSRegionalHQId,
	NWSNationalHQId,
	officeId,
	arrived,
	LandRegionCode,
	RegionCode,
	NWSZoneType,
};

const endpoints = makeApi([
	{
		method: "get",
		path: "/alerts",
		alias: "alerts_query",
		description: `Returns all alerts`,
		requestFormat: "json",
		parameters: [
			{
				name: "active",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "start",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "end",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "status",
				type: "Query",
				schema: z.array(z.enum(["actual", "exercise", "system", "test", "draft"])).optional()
			},
			{
				name: "message_type",
				type: "Query",
				schema: z.array(z.enum(["alert", "update", "cancel"])).optional()
			},
			{
				name: "event",
				type: "Query",
				schema: z.array(z.string().regex(/^[A-Za-z0-9 ]+$/)).optional()
			},
			{
				name: "code",
				type: "Query",
				schema: z.array(z.string().regex(/^\w{3}$/)).optional()
			},
			{
				name: "area",
				type: "Query",
				schema: z.array(AreaCode).optional()
			},
			{
				name: "point",
				type: "Query",
				schema: z.string().regex(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/).optional()
			},
			{
				name: "region",
				type: "Query",
				schema: z.array(MarineRegionCode).optional()
			},
			{
				name: "region_type",
				type: "Query",
				schema: z.enum(["land", "marine"]).optional()
			},
			{
				name: "zone",
				type: "Query",
				schema: z.array(NWSZoneID).optional()
			},
			{
				name: "urgency",
				type: "Query",
				schema: z.array(AlertUrgency).optional()
			},
			{
				name: "severity",
				type: "Query",
				schema: z.array(AlertSeverity).optional()
			},
			{
				name: "certainty",
				type: "Query",
				schema: z.array(AlertCertainty).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional().default(500)
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 301,
				description: `Certain common queries may be redirected to discrete URLs`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/alerts/:id",
		alias: "alerts_single",
		description: `Returns a specific alert`,
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/alerts/active",
		alias: "alerts_active",
		description: `Returns all currently active alerts`,
		requestFormat: "json",
		parameters: [
			{
				name: "status",
				type: "Query",
				schema: z.array(z.enum(["actual", "exercise", "system", "test", "draft"])).optional()
			},
			{
				name: "message_type",
				type: "Query",
				schema: z.array(z.enum(["alert", "update", "cancel"])).optional()
			},
			{
				name: "event",
				type: "Query",
				schema: z.array(z.string().regex(/^[A-Za-z0-9 ]+$/)).optional()
			},
			{
				name: "code",
				type: "Query",
				schema: z.array(z.string().regex(/^\w{3}$/)).optional()
			},
			{
				name: "area",
				type: "Query",
				schema: z.array(AreaCode).optional()
			},
			{
				name: "point",
				type: "Query",
				schema: z.string().regex(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/).optional()
			},
			{
				name: "region",
				type: "Query",
				schema: z.array(MarineRegionCode).optional()
			},
			{
				name: "region_type",
				type: "Query",
				schema: z.enum(["land", "marine"]).optional()
			},
			{
				name: "zone",
				type: "Query",
				schema: z.array(NWSZoneID).optional()
			},
			{
				name: "urgency",
				type: "Query",
				schema: z.array(AlertUrgency).optional()
			},
			{
				name: "severity",
				type: "Query",
				schema: z.array(AlertSeverity).optional()
			},
			{
				name: "certainty",
				type: "Query",
				schema: z.array(AlertCertainty).optional()
			},
		],
		response: z.void(),
		errors: [
			{
				status: 301,
				description: `Certain common queries may be redirected to discrete URLs`,
				schema: z.void()
			},
		]
	},
	{
		method: "get",
		path: "/alerts/active/area/:area",
		alias: "alerts_active_area",
		description: `Returns active alerts for the given area (state or marine area)`,
		requestFormat: "json",
		parameters: [
			{
				name: "area",
				type: "Path",
				schema: area
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/alerts/active/count",
		alias: "alerts_active_count",
		description: `Returns info on the number of active alerts`,
		requestFormat: "json",
		response: z.void(),
	},
	{
		method: "get",
		path: "/alerts/active/region/:region",
		alias: "alerts_active_region",
		description: `Returns active alerts for the given marine region`,
		requestFormat: "json",
		parameters: [
			{
				name: "region",
				type: "Path",
				schema: z.enum(["AL", "AT", "GL", "GM", "PA", "PI"])
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/alerts/active/zone/:zoneId",
		alias: "alerts_active_zone",
		description: `Returns active alerts for the given NWS public zone or county`,
		requestFormat: "json",
		parameters: [
			{
				name: "zoneId",
				type: "Path",
				schema: z.string().regex(/^(A[KLMNRSZ]|C[AOT]|D[CE]|F[LM]|G[AMU]|I[ADLN]|K[SY]|L[ACEHMOS]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AHKMRSWZ]|S[CDL]|T[NX]|UT|V[AIT]|W[AIVY]|[HR]I)[CZ]\d{3}$/)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/alerts/types",
		alias: "alerts_types",
		description: `Returns a list of alert types`,
		requestFormat: "json",
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/cwsus/:cwsuId",
		alias: "cwsu",
		description: `Returns metadata about a Center Weather Service Unit`,
		requestFormat: "json",
		parameters: [
			{
				name: "cwsuId",
				type: "Path",
				schema: z.enum(["ZAB", "ZAN", "ZAU", "ZBW", "ZDC", "ZDV", "ZFA", "ZFW", "ZHU", "ZID", "ZJX", "ZKC", "ZLA", "ZLC", "ZMA", "ZME", "ZMP", "ZNY", "ZOA", "ZOB", "ZSE", "ZTL"])
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/cwsus/:cwsuId/cwas",
		alias: "cwas",
		description: `Returns a list of Center Weather Advisories from a CWSU`,
		requestFormat: "json",
		parameters: [
			{
				name: "cwsuId",
				type: "Path",
				schema: z.enum(["ZAB", "ZAN", "ZAU", "ZBW", "ZDC", "ZDV", "ZFA", "ZFW", "ZHU", "ZID", "ZJX", "ZKC", "ZLA", "ZLC", "ZMA", "ZME", "ZMP", "ZNY", "ZOA", "ZOB", "ZSE", "ZTL"])
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/cwsus/:cwsuId/cwas/:date/:sequence",
		alias: "cwa",
		description: `Returns a list of Center Weather Advisories from a CWSU`,
		requestFormat: "json",
		parameters: [
			{
				name: "cwsuId",
				type: "Path",
				schema: z.enum(["ZAB", "ZAN", "ZAU", "ZBW", "ZDC", "ZDV", "ZFA", "ZFW", "ZHU", "ZID", "ZJX", "ZKC", "ZLA", "ZLC", "ZMA", "ZME", "ZMP", "ZNY", "ZOA", "ZOB", "ZSE", "ZTL"])
			},
			{
				name: "date",
				type: "Path",
				schema: z.string()
			},
			{
				name: "sequence",
				type: "Path",
				schema: z.number().int().gte(100)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/sigmets",
		alias: "sigmetQuery",
		description: `Returns a list of SIGMET/AIRMETs`,
		requestFormat: "json",
		parameters: [
			{
				name: "start",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "end",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "date",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "atsu",
				type: "Query",
				schema: z.string().regex(/^[A-Z]{3,4}$/).optional()
			},
			{
				name: "sequence",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/sigmets/:atsu",
		alias: "sigmetsByATSU",
		description: `Returns a list of SIGMET/AIRMETs for the specified ATSU`,
		requestFormat: "json",
		parameters: [
			{
				name: "atsu",
				type: "Path",
				schema: z.string().regex(/^[A-Z]{3,4}$/)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/sigmets/:atsu/:date",
		alias: "sigmetsByATSUByDate",
		description: `Returns a list of SIGMET/AIRMETs for the specified ATSU for the specified date`,
		requestFormat: "json",
		parameters: [
			{
				name: "atsu",
				type: "Path",
				schema: z.string().regex(/^[A-Z]{3,4}$/)
			},
			{
				name: "date",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/aviation/sigmets/:atsu/:date/:time",
		alias: "sigmet",
		description: `Returns a specific SIGMET/AIRMET`,
		requestFormat: "json",
		parameters: [
			{
				name: "atsu",
				type: "Path",
				schema: z.string().regex(/^[A-Z]{3,4}$/)
			},
			{
				name: "date",
				type: "Path",
				schema: z.string()
			},
			{
				name: "time",
				type: "Path",
				schema: z.string().regex(/^([01][0-9]|2[0-3])[0-5][0-9]$/)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/glossary",
		alias: "glossary",
		description: `Returns glossary terms`,
		requestFormat: "json",
		response: z.void(),
	},
	{
		method: "get",
		path: "/gridpoints/:wfo/:x,:y",
		alias: "gridpoint",
		description: `Returns raw numerical forecast data for a 2.5km grid area`,
		requestFormat: "json",
		parameters: [
			{
				name: "wfo",
				type: "Path",
				schema: z.enum(["AKQ", "ALY", "BGM", "BOX", "BTV", "BUF", "CAE", "CAR", "CHS", "CLE", "CTP", "GSP", "GYX", "ILM", "ILN", "LWX", "MHX", "OKX", "PBZ", "PHI", "RAH", "RLX", "RNK", "ABQ", "AMA", "BMX", "BRO", "CRP", "EPZ", "EWX", "FFC", "FWD", "HGX", "HUN", "JAN", "JAX", "KEY", "LCH", "LIX", "LUB", "LZK", "MAF", "MEG", "MFL", "MLB", "MOB", "MRX", "OHX", "OUN", "SHV", "SJT", "SJU", "TAE", "TBW", "TSA", "ABR", "APX", "ARX", "BIS", "BOU", "CYS", "DDC", "DLH", "DMX", "DTX", "DVN", "EAX", "FGF", "FSD", "GID", "GJT", "GLD", "GRB", "GRR", "ICT", "ILX", "IND", "IWX", "JKL", "LBF", "LMK", "LOT", "LSX", "MKX", "MPX", "MQT", "OAX", "PAH", "PUB", "RIW", "SGF", "TOP", "UNR", "BOI", "BYZ", "EKA", "FGZ", "GGW", "HNX", "LKN", "LOX", "MFR", "MSO", "MTR", "OTX", "PDT", "PIH", "PQR", "PSR", "REV", "SEW", "SGX", "SLC", "STO", "TFX", "TWC", "VEF", "AER", "AFC", "AFG", "AJK", "ALU", "GUM", "HPA", "HFO", "PPG", "STU", "NH1", "NH2", "ONA", "ONP"])
			},
			{
				name: "x",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "y",
				type: "Path",
				schema: z.number().int().gte(0)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/gridpoints/:wfo/:x,:y/forecast",
		alias: "gridpoint_forecast",
		description: `Returns a textual forecast for a 2.5km grid area`,
		requestFormat: "json",
		parameters: [
			{
				name: "wfo",
				type: "Path",
				schema: z.enum(["AKQ", "ALY", "BGM", "BOX", "BTV", "BUF", "CAE", "CAR", "CHS", "CLE", "CTP", "GSP", "GYX", "ILM", "ILN", "LWX", "MHX", "OKX", "PBZ", "PHI", "RAH", "RLX", "RNK", "ABQ", "AMA", "BMX", "BRO", "CRP", "EPZ", "EWX", "FFC", "FWD", "HGX", "HUN", "JAN", "JAX", "KEY", "LCH", "LIX", "LUB", "LZK", "MAF", "MEG", "MFL", "MLB", "MOB", "MRX", "OHX", "OUN", "SHV", "SJT", "SJU", "TAE", "TBW", "TSA", "ABR", "APX", "ARX", "BIS", "BOU", "CYS", "DDC", "DLH", "DMX", "DTX", "DVN", "EAX", "FGF", "FSD", "GID", "GJT", "GLD", "GRB", "GRR", "ICT", "ILX", "IND", "IWX", "JKL", "LBF", "LMK", "LOT", "LSX", "MKX", "MPX", "MQT", "OAX", "PAH", "PUB", "RIW", "SGF", "TOP", "UNR", "BOI", "BYZ", "EKA", "FGZ", "GGW", "HNX", "LKN", "LOX", "MFR", "MSO", "MTR", "OTX", "PDT", "PIH", "PQR", "PSR", "REV", "SEW", "SGX", "SLC", "STO", "TFX", "TWC", "VEF", "AER", "AFC", "AFG", "AJK", "ALU", "GUM", "HPA", "HFO", "PPG", "STU", "NH1", "NH2", "ONA", "ONP"])
			},
			{
				name: "x",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "y",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.enum(["forecast_temperature_qv", "forecast_wind_speed_qv"])).optional()
			},
			{
				name: "units",
				type: "Query",
				schema: z.enum(["us", "si"]).optional().default("us")
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/gridpoints/:wfo/:x,:y/forecast/hourly",
		alias: "gridpoint_forecast_hourly",
		description: `Returns a textual hourly forecast for a 2.5km grid area`,
		requestFormat: "json",
		parameters: [
			{
				name: "wfo",
				type: "Path",
				schema: z.enum(["AKQ", "ALY", "BGM", "BOX", "BTV", "BUF", "CAE", "CAR", "CHS", "CLE", "CTP", "GSP", "GYX", "ILM", "ILN", "LWX", "MHX", "OKX", "PBZ", "PHI", "RAH", "RLX", "RNK", "ABQ", "AMA", "BMX", "BRO", "CRP", "EPZ", "EWX", "FFC", "FWD", "HGX", "HUN", "JAN", "JAX", "KEY", "LCH", "LIX", "LUB", "LZK", "MAF", "MEG", "MFL", "MLB", "MOB", "MRX", "OHX", "OUN", "SHV", "SJT", "SJU", "TAE", "TBW", "TSA", "ABR", "APX", "ARX", "BIS", "BOU", "CYS", "DDC", "DLH", "DMX", "DTX", "DVN", "EAX", "FGF", "FSD", "GID", "GJT", "GLD", "GRB", "GRR", "ICT", "ILX", "IND", "IWX", "JKL", "LBF", "LMK", "LOT", "LSX", "MKX", "MPX", "MQT", "OAX", "PAH", "PUB", "RIW", "SGF", "TOP", "UNR", "BOI", "BYZ", "EKA", "FGZ", "GGW", "HNX", "LKN", "LOX", "MFR", "MSO", "MTR", "OTX", "PDT", "PIH", "PQR", "PSR", "REV", "SEW", "SGX", "SLC", "STO", "TFX", "TWC", "VEF", "AER", "AFC", "AFG", "AJK", "ALU", "GUM", "HPA", "HFO", "PPG", "STU", "NH1", "NH2", "ONA", "ONP"])
			},
			{
				name: "x",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "y",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.enum(["forecast_temperature_qv", "forecast_wind_speed_qv"])).optional()
			},
			{
				name: "units",
				type: "Query",
				schema: z.enum(["us", "si"]).optional().default("us")
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/gridpoints/:wfo/:x,:y/stations",
		alias: "gridpoint_stations",
		description: `Returns a list of observation stations usable for a given 2.5km grid area`,
		requestFormat: "json",
		parameters: [
			{
				name: "wfo",
				type: "Path",
				schema: z.enum(["AKQ", "ALY", "BGM", "BOX", "BTV", "BUF", "CAE", "CAR", "CHS", "CLE", "CTP", "GSP", "GYX", "ILM", "ILN", "LWX", "MHX", "OKX", "PBZ", "PHI", "RAH", "RLX", "RNK", "ABQ", "AMA", "BMX", "BRO", "CRP", "EPZ", "EWX", "FFC", "FWD", "HGX", "HUN", "JAN", "JAX", "KEY", "LCH", "LIX", "LUB", "LZK", "MAF", "MEG", "MFL", "MLB", "MOB", "MRX", "OHX", "OUN", "SHV", "SJT", "SJU", "TAE", "TBW", "TSA", "ABR", "APX", "ARX", "BIS", "BOU", "CYS", "DDC", "DLH", "DMX", "DTX", "DVN", "EAX", "FGF", "FSD", "GID", "GJT", "GLD", "GRB", "GRR", "ICT", "ILX", "IND", "IWX", "JKL", "LBF", "LMK", "LOT", "LSX", "MKX", "MPX", "MQT", "OAX", "PAH", "PUB", "RIW", "SGF", "TOP", "UNR", "BOI", "BYZ", "EKA", "FGZ", "GGW", "HNX", "LKN", "LOX", "MFR", "MSO", "MTR", "OTX", "PDT", "PIH", "PQR", "PSR", "REV", "SEW", "SGX", "SLC", "STO", "TFX", "TWC", "VEF", "AER", "AFC", "AFG", "AJK", "ALU", "GUM", "HPA", "HFO", "PPG", "STU", "NH1", "NH2", "ONA", "ONP"])
			},
			{
				name: "x",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "y",
				type: "Path",
				schema: z.number().int().gte(0)
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional().default(500)
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.literal("obs_station_provider")).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/offices/:officeId",
		alias: "office",
		description: `Returns metadata about a NWS forecast office`,
		requestFormat: "json",
		parameters: [
			{
				name: "officeId",
				type: "Path",
				schema: officeId
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/offices/:officeId/headlines",
		alias: "office_headlines",
		description: `Returns a list of news headlines for a given NWS office`,
		requestFormat: "json",
		parameters: [
			{
				name: "officeId",
				type: "Path",
				schema: officeId
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/offices/:officeId/headlines/:headlineId",
		alias: "office_headline",
		description: `Returns a specific news headline for a given NWS office`,
		requestFormat: "json",
		parameters: [
			{
				name: "officeId",
				type: "Path",
				schema: officeId
			},
			{
				name: "headlineId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/points/:latitude,:longitude",
		alias: "point",
		description: `Returns metadata about a given latitude/longitude point`,
		requestFormat: "json",
		parameters: [
			{
				name: "latitude",
				type: "Path",
				schema: z.number().gte(-90).lte(90).multipleOf(0.0001)
			},
			{
				name: "longitude",
				type: "Path",
				schema: z.number().gte(-180).lte(180).multipleOf(0.0001)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products",
		alias: "products_query",
		description: `Returns a list of text products`,
		requestFormat: "json",
		parameters: [
			{
				name: "location",
				type: "Query",
				schema: z.array(z.string()).optional()
			},
			{
				name: "start",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "end",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "office",
				type: "Query",
				schema: z.array(z.string().regex(/^[A-Z]{4}$/)).optional()
			},
			{
				name: "wmoid",
				type: "Query",
				schema: z.array(z.string().regex(/^[A-Z]{4}\d{2}$/)).optional()
			},
			{
				name: "type",
				type: "Query",
				schema: z.array(z.string().regex(/^\w{3}$/)).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/:productId",
		alias: "product",
		description: `Returns a specific text product`,
		requestFormat: "json",
		parameters: [
			{
				name: "productId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/locations",
		alias: "product_locations",
		description: `Returns a list of valid text product issuance locations`,
		requestFormat: "json",
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/locations/:locationId/types",
		alias: "location_products",
		description: `Returns a list of valid text product types for a given issuance location`,
		requestFormat: "json",
		parameters: [
			{
				name: "locationId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/types",
		alias: "product_types",
		description: `Returns a list of valid text product types and codes`,
		requestFormat: "json",
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/types/:typeId",
		alias: "products_type",
		description: `Returns a list of text products of a given type`,
		requestFormat: "json",
		parameters: [
			{
				name: "typeId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/types/:typeId/locations",
		alias: "products_type_locations",
		description: `Returns a list of valid text product issuance locations for a given product type`,
		requestFormat: "json",
		parameters: [
			{
				name: "typeId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/types/:typeId/locations/:locationId",
		alias: "products_type_location",
		description: `Returns a list of text products of a given type for a given issuance location`,
		requestFormat: "json",
		parameters: [
			{
				name: "typeId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "locationId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/products/types/:typeId/locations/:locationId/latest",
		alias: "latest_product_type_location",
		description: `Returns latest text products of a given type for a given issuance location with product text`,
		requestFormat: "json",
		parameters: [
			{
				name: "typeId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "locationId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/profilers/:stationId",
		alias: "radar_profiler",
		description: `Returns metadata about a given radar wind profiler`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "time",
				type: "Query",
				schema: arrived
			},
			{
				name: "interval",
				type: "Query",
				schema: z.string().regex(/^P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/queues/:host",
		alias: "radar_queue",
		description: `Returns metadata about a given radar queue`,
		requestFormat: "json",
		parameters: [
			{
				name: "host",
				type: "Path",
				schema: z.string()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional()
			},
			{
				name: "arrived",
				type: "Query",
				schema: arrived
			},
			{
				name: "created",
				type: "Query",
				schema: arrived
			},
			{
				name: "published",
				type: "Query",
				schema: arrived
			},
			{
				name: "station",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "type",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "feed",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "resolution",
				type: "Query",
				schema: z.number().int().gte(1).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/servers",
		alias: "radar_servers",
		description: `Returns a list of radar servers`,
		requestFormat: "json",
		parameters: [
			{
				name: "reportingHost",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/servers/:id",
		alias: "radar_server",
		description: `Returns metadata about a given radar server`,
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Path",
				schema: z.string()
			},
			{
				name: "reportingHost",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/stations",
		alias: "radar_stations",
		description: `Returns a list of radar stations`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationType",
				type: "Query",
				schema: z.array(z.string().regex(/^[A-Za-z0-9-]+$/)).optional()
			},
			{
				name: "reportingHost",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "host",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/stations/:stationId",
		alias: "radar_station",
		description: `Returns metadata about a given radar station`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "reportingHost",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "host",
				type: "Query",
				schema: z.string().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/radar/stations/:stationId/alarms",
		alias: "radar_station_alarms",
		description: `Returns metadata about a given radar station alarms`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations",
		alias: "obs_stations",
		description: `Returns a list of observation stations.`,
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Query",
				schema: z.array(z.string()).optional()
			},
			{
				name: "state",
				type: "Query",
				schema: z.array(AreaCode).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional().default(500)
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.literal("obs_station_provider")).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId",
		alias: "obs_station",
		description: `Returns metadata about a given observation station`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.literal("obs_station_provider")).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId/observations",
		alias: "station_observation_list",
		description: `Returns a list of observations for a given station`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "start",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "end",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId/observations/:time",
		alias: "station_observation_time",
		description: `Returns a single observation.`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "time",
				type: "Path",
				schema: z.string().datetime({ offset: true })
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId/observations/latest",
		alias: "station_observation_latest",
		description: `Returns the latest observation for a station`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "require_qc",
				type: "Query",
				schema: z.boolean().optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId/tafs",
		alias: "tafs",
		description: `Returns Terminal Aerodrome Forecasts for the specified airport station.`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/stations/:stationId/tafs/:date/:time",
		alias: "taf",
		description: `Returns a single Terminal Aerodrome Forecast.`,
		requestFormat: "json",
		parameters: [
			{
				name: "stationId",
				type: "Path",
				schema: z.string()
			},
			{
				name: "date",
				type: "Path",
				schema: z.string()
			},
			{
				name: "time",
				type: "Path",
				schema: z.string().regex(/^([01][0-9]|2[0-3])[0-5][0-9]$/)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones",
		alias: "zone_list",
		description: `Returns a list of zones`,
		requestFormat: "json",
		parameters: [
			{
				name: "id",
				type: "Query",
				schema: z.array(NWSZoneID).optional()
			},
			{
				name: "area",
				type: "Query",
				schema: z.array(AreaCode).optional()
			},
			{
				name: "region",
				type: "Query",
				schema: z.array(RegionCode).optional()
			},
			{
				name: "type",
				type: "Query",
				schema: z.array(NWSZoneType).optional()
			},
			{
				name: "point",
				type: "Query",
				schema: z.string().regex(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/).optional()
			},
			{
				name: "include_geometry",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).optional()
			},
			{
				name: "effective",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones/:type",
		alias: "zone_list_type",
		description: `Returns a list of zones of a given type`,
		requestFormat: "json",
		parameters: [
			{
				name: "type",
				type: "Query",
				schema: z.array(NWSZoneType).optional()
			},
			{
				name: "id",
				type: "Query",
				schema: z.array(NWSZoneID).optional()
			},
			{
				name: "area",
				type: "Query",
				schema: z.array(AreaCode).optional()
			},
			{
				name: "region",
				type: "Query",
				schema: z.array(RegionCode).optional()
			},
			{
				name: "point",
				type: "Query",
				schema: z.string().regex(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/).optional()
			},
			{
				name: "include_geometry",
				type: "Query",
				schema: z.boolean().optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).optional()
			},
			{
				name: "effective",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones/:type/:zoneId",
		alias: "zone",
		description: `Returns metadata about a given zone`,
		requestFormat: "json",
		parameters: [
			{
				name: "type",
				type: "Path",
				schema: z.enum(["land", "marine", "forecast", "public", "coastal", "offshore", "fire", "county"])
			},
			{
				name: "zoneId",
				type: "Path",
				schema: z.string().regex(/^(A[KLMNRSZ]|C[AOT]|D[CE]|F[LM]|G[AMU]|I[ADLN]|K[SY]|L[ACEHMOS]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AHKMRSWZ]|S[CDL]|T[NX]|UT|V[AIT]|W[AIVY]|[HR]I)[CZ]\d{3}$/)
			},
			{
				name: "effective",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones/:type/:zoneId/forecast",
		alias: "zone_forecast",
		description: `Returns the current zone forecast for a given zone`,
		requestFormat: "json",
		parameters: [
			{
				name: "type",
				type: "Path",
				schema: z.string()
			},
			{
				name: "zoneId",
				type: "Path",
				schema: z.string().regex(/^(A[KLMNRSZ]|C[AOT]|D[CE]|F[LM]|G[AMU]|I[ADLN]|K[SY]|L[ACEHMOS]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AHKMRSWZ]|S[CDL]|T[NX]|UT|V[AIT]|W[AIVY]|[HR]I)[CZ]\d{3}$/)
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones/forecast/:zoneId/observations",
		alias: "zone_obs",
		description: `Returns a list of observations for a given zone`,
		requestFormat: "json",
		parameters: [
			{
				name: "zoneId",
				type: "Path",
				schema: z.string().regex(/^(A[KLMNRSZ]|C[AOT]|D[CE]|F[LM]|G[AMU]|I[ADLN]|K[SY]|L[ACEHMOS]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AHKMRSWZ]|S[CDL]|T[NX]|UT|V[AIT]|W[AIVY]|[HR]I)[CZ]\d{3}$/)
			},
			{
				name: "start",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "end",
				type: "Query",
				schema: z.string().datetime({ offset: true }).optional()
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional()
			},
		],
		response: z.void(),
	},
	{
		method: "get",
		path: "/zones/forecast/:zoneId/stations",
		alias: "zone_stations",
		description: `Returns a list of observation stations for a given zone`,
		requestFormat: "json",
		parameters: [
			{
				name: "zoneId",
				type: "Path",
				schema: z.string().regex(/^(A[KLMNRSZ]|C[AOT]|D[CE]|F[LM]|G[AMU]|I[ADLN]|K[SY]|L[ACEHMOS]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[AHKMRSWZ]|S[CDL]|T[NX]|UT|V[AIT]|W[AIVY]|[HR]I)[CZ]\d{3}$/)
			},
			{
				name: "limit",
				type: "Query",
				schema: z.number().int().gte(1).lte(500).optional().default(500)
			},
			{
				name: "cursor",
				type: "Query",
				schema: z.string().optional()
			},
			{
				name: "Feature-Flags",
				type: "Header",
				schema: z.array(z.literal("obs_station_provider")).optional()
			},
		],
		response: z.void(),
	},
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
