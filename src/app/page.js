'use client'
import { useState, useEffect, useCallback } from 'react'
import { lookupProjectName } from '@/lib/projectNames'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CACHE_KEY_DATA = 'ura_allsites_v1'
const CACHE_KEY_TS   = 'ura_ts_v1'
const CACHE_TTL      = 24 * 60 * 60 * 1000 // 24 hours

const C = {
  ink:'#0f1117', paper:'#f5f4ef', accent:'#c84b2f', green:'#2a6b4f',
  muted:'#9b9890', rule:'#dddad2', blue:'#2563eb',
  ecColor:'#d97706', privColor:'#2563eb', teal:'#0f766e', amber:'#e8a020'
}

// ─── FALLBACK DATA ────────────────────────────────────────────────────────────
const FALLBACK_EC = [
  {location:'Yishun E13 / Miltonia Close',planningArea:'Yishun',lease:99,siteArea:15451,gfa:43264,bids:3,tenderer:'Hoi Hup Realty',price:340850000,psmGfa:0,awardDate:'2026-04-21'},
  {location:'Woodlands E10 / Woodlands Drive 17',planningArea:'Woodlands',lease:99,siteArea:26980,gfa:56658,bids:3,tenderer:'Sim Lian Land & Dev',price:484000000,psmGfa:0,awardDate:'2026-01-20'},
  {location:'Sembawang E8 / Sembawang Road',planningArea:'Sembawang',lease:99,siteArea:18967,gfa:26555,bids:4,tenderer:'Oriental Pacific Dev',price:197777000,psmGfa:0,awardDate:'2025-09-26'},
  {location:'Woodlands E8 / Woodlands Drive 17',planningArea:'Woodlands',lease:99,siteArea:25207,gfa:42853,bids:5,tenderer:'CDL Divine',price:360899000,psmGfa:0,awardDate:'2025-08-26'},
  {location:'Bukit Panjang E6 / Senja Close',planningArea:'Bukit Panjang',lease:99,siteArea:10159,gfa:30478,bids:5,tenderer:'CDL Constellation',price:252899000,psmGfa:0,awardDate:'2025-08-26'},
  {location:'Tampines E18 / Tampines St 95',planningArea:'Tampines',lease:99,siteArea:22489,gfa:56223,bids:5,tenderer:'Sim Lian Land',price:465000000,psmGfa:0,awardDate:'2024-11-08'},
  {location:'Pasir Ris E11 / Jalan Loyang Besar',planningArea:'Pasir Ris',lease:99,siteArea:28406,gfa:71014,bids:4,tenderer:'CNQC / Forsea / ZACD',price:557000000,psmGfa:0,awardDate:'2024-08-16'},
  {location:'Tengah E3 / Plantation Close',planningArea:'Tengah',lease:99,siteArea:20038,gfa:56107,bids:4,tenderer:'Hoi Hup / Sunway',price:423380000,psmGfa:0,awardDate:'2024-02-14'},
  {location:'Tampines E13 / Tampines St 62B',planningArea:'Tampines',lease:99,siteArea:28000,gfa:70001,bids:9,tenderer:'Sim Lian',price:543280000,psmGfa:0,awardDate:'2023-10-09'},
  {location:'Tengah E2 / Plantation Close',planningArea:'Tengah',lease:99,siteArea:16441,gfa:46036,bids:9,tenderer:'Hoi Hup / Sunway',price:348500000,psmGfa:0,awardDate:'2023-09-11'},
  {location:'Bukit Batok E12 / Bukit Batok West Ave 5',planningArea:'Bukit Batok',lease:99,siteArea:16624,gfa:49872,bids:4,tenderer:'CDL Zenith',price:336068000,psmGfa:0,awardDate:'2022-09-28'},
  {location:'Bukit Batok E11 / Bukit Batok West Ave 8',planningArea:'Bukit Batok',lease:99,siteArea:12449,gfa:37348,bids:9,tenderer:'CNQC-OS / SNC',price:266000000,psmGfa:0,awardDate:'2022-03-22'},
  {location:'Tampines E12 / Tampines St 62A',planningArea:'Tampines',lease:99,siteArea:23799,gfa:59498,bids:9,tenderer:'QJ-OS / Santarli',price:422000000,psmGfa:0,awardDate:'2021-08-03'},
  {location:'Tengah E1 / Tengah Garden Walk',planningArea:'Tengah',lease:99,siteArea:22021,gfa:61659,bids:7,tenderer:'Taurus Properties',price:400318000,psmGfa:0,awardDate:'2021-06-03'},
  {location:'Yishun E10 / Yishun Avenue 9',planningArea:'Yishun',lease:99,siteArea:21514,gfa:60240,bids:7,tenderer:'Sing Holdings',price:373500000,psmGfa:0,awardDate:'2020-11-20'},
  {location:'Sengkang E14 / Fernvale Lane',planningArea:'Sengkang',lease:99,siteArea:17130,gfa:47964,bids:7,tenderer:'FCL Lodge',price:286538000,psmGfa:0,awardDate:'2020-03-11'},
  {location:'Sembawang E5 / Canberra Link',planningArea:'Sembawang',lease:99,siteArea:16690,gfa:38387,bids:8,tenderer:'MCC Land',price:233890000,psmGfa:0,awardDate:'2019-10-11'},
  {location:'Tampines E14 / Tampines Avenue 10',planningArea:'Tampines',lease:99,siteArea:24934,gfa:69815,bids:7,tenderer:'Hoi Hup / Sunway',price:434450000,psmGfa:0,awardDate:'2019-01-22'},
  {location:'Sengkang E18 / Anchorvale Crescent',planningArea:'Sengkang',lease:99,siteArea:17137,gfa:51412,bids:7,tenderer:'Evia / Gamuda',price:318888899,psmGfa:0,awardDate:'2018-09-27'},
  {location:'Sembawang E3b / Canberra Link',planningArea:'Sembawang',lease:99,siteArea:18041,gfa:45102,bids:9,tenderer:'Hoi Hup / Sunway',price:271000000,psmGfa:0,awardDate:'2018-09-10'},
  {location:'Punggol E13 / Sumang Walk',planningArea:'Punggol',lease:99,siteArea:27056,gfa:81169,bids:17,tenderer:'CDL / TID',price:509370000,psmGfa:0,awardDate:'2018-03-07'},
]

const FALLBACK_PRIV = [{location:"Peck Hay Road",area:"Newton",devtType:"Residential",lease:99,siteArea:5513.5,gfa:27017.0,bids:4,tenderer:"CDL Constellation Pte. Ltd. and Garden Estates (Pte.) Limite",price:542400000.0,psmGfa:20076.25,awardDate:"2026-06-16"},
{location:"Holland Plain",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:15716.9,gfa:28291.0,bids:1,tenderer:"Sim Lian Land Pte Ltd and Sim Lian Development Pte Ltd",price:454000000.0,psmGfa:16047.51,awardDate:"2026-05-12"},
{location:"Dunearn Road",area:"Bukit Timah",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:19045.9,gfa:30474.0,bids:6,tenderer:"Winrich Investment Pte. Ltd. and Metrobilt Construction Pte ",price:532999999.0,psmGfa:17490.32,awardDate:"2026-05-04"},
{location:"Kallang Close",area:"Kallang",devtType:"Residential",lease:99,siteArea:11456.3,gfa:40098.0,bids:4,tenderer:"Frasers Property Phoenix Pte. Ltd. and MJR Investment Pte. L",price:610750000.0,psmGfa:15231.43,awardDate:"2026-04-10"},
{location:"Dover Drive",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:13517.2,gfa:56773.0,bids:6,tenderer:"CNQC Realty (Prime) Pte. Ltd., Forsea Residence Pte. Ltd. an",price:951000999.0,psmGfa:16750.94,awardDate:"2026-03-31"},
{location:"Lentor Central",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:15925.8,gfa:47778.0,bids:5,tenderer:"GuocoLand (Singapore) Pte. Ltd., Intrepid Investments Pte. L",price:657100000.0,psmGfa:13753.19,awardDate:"2026-03-06"},
{location:"Tanjong Rhu Road",area:"Kallang",devtType:"Residential",lease:99,siteArea:12239.3,gfa:45286.0,bids:5,tenderer:"CDL Constellation Pte. Ltd. and Bedrock Ventures Pte. Ltd.",price:709252000.0,psmGfa:15661.62,awardDate:"2026-02-10"},
{location:"Dairy Farm Walk",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:29444.2,gfa:41222.0,bids:5,tenderer:"ABR Holdings Limited, LWH Holdings Pte. Ltd., Macly Capital ",price:427000268.0,psmGfa:10358.55,awardDate:"2026-01-28"},
{location:"Bedok Rise",area:"Bedok",devtType:"Residential",lease:99,siteArea:20293.6,gfa:32470.0,bids:10,tenderer:"Bellis Residential Pte. Ltd.",price:464800000.0,psmGfa:14314.75,awardDate:"2025-12-02"},
{location:"Bukit Timah Road",area:"Newton",devtType:"Residential",lease:99,siteArea:5899.2,gfa:28907.0,bids:8,tenderer:"HH Investment Private Limited",price:566291711.95,psmGfa:19590.12,awardDate:"2025-11-21"},
{location:"Telok Blangah Road",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:13689.3,gfa:64340.0,bids:3,tenderer:"Kingsford Huray Development Pte Ltd",price:918300400.0,psmGfa:14272.62,awardDate:"2025-11-20"},
{location:"Upper Thomson Road (Parcel A)",area:"Yishun",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:24421.9,gfa:53729.0,bids:5,tenderer:"Wee Hur Property Pte Ltd and GSC Holdings Pte Ltd",price:613939000.0,psmGfa:11426.59,awardDate:"2025-10-31"},
{location:"Dorset Road",area:"Kallang",devtType:"Residential",lease:99,siteArea:10399.0,gfa:36397.0,bids:9,tenderer:"United Venture Development (2022) Pte. Ltd.",price:524300800.0,psmGfa:14405.06,awardDate:"2025-10-16"},
{location:"Chuan Grove (1H2025)",area:"Serangoon",devtType:"Residential",lease:99,siteArea:14514.3,gfa:43543.0,bids:5,tenderer:"Sing Holdings Residential Pte. Ltd. and Sunway Developments ",price:623910000.0,psmGfa:14328.59,awardDate:"2025-09-10"},
{location:"Holland Link",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:17069.0,gfa:23897.0,bids:5,tenderer:"Sim Lian Land Pte Ltd and Sim Lian Development Pte Ltd",price:368368368.0,psmGfa:15414.84,awardDate:"2025-08-07"},
{location:"Chuan Grove",area:"Serangoon",devtType:"Residential",lease:99,siteArea:15831.5,gfa:47495.0,bids:7,tenderer:"Sing Holdings Residential Pte. Ltd. and Sunway Developments ",price:703600000.0,psmGfa:14814.19,awardDate:"2025-07-17"},
{location:"Dunearn Road",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:13491.9,gfa:32381.0,bids:9,tenderer:"CSC Land Group (Singapore) Pte. Ltd., Sekisui House, Ltd. an",price:491454208.0,psmGfa:15177.24,awardDate:"2025-07-03"},
{location:"Lakeside Drive",area:"Jurong West",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:13485.1,gfa:49895.0,bids:6,tenderer:"CDL Polaris Properties Pte. Ltd. and CDL Polaris Commercial ",price:608000000.0,psmGfa:12185.59,awardDate:"2025-06-09"},
{location:"Lentor Gardens",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:20639.4,gfa:43343.0,bids:2,tenderer:"Kingsford Huray Development Pte Ltd",price:429230000.0,psmGfa:9903.1,awardDate:"2025-04-09"},
{location:"Bayshore Road",area:"Bedok",devtType:"Residential",lease:99,siteArea:10497.3,gfa:44089.0,bids:8,tenderer:"Sing-Haiyi Garnet Pte. Ltd.",price:658888998.0,psmGfa:14944.52,awardDate:"2025-03-28"},
{location:"Media Circle (Parcel A)",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:7629.7,gfa:28230.0,bids:3,tenderer:"CNQC Realty (Bloomsbury) Pte. Ltd., Forsea Residence Pte. Lt",price:315000000.0,psmGfa:11158.34,awardDate:"2025-03-13"},
{location:"River Valley Green (Parcel B)",area:"River Valley",devtType:"Residential with Commercial at  1st Storey",lease:99,siteArea:11736.0,gfa:41076.0,bids:5,tenderer:"GLL B Pte. Ltd.",price:627835896.0,psmGfa:15284.74,awardDate:"2025-02-13"},
{location:"Dairy Farm Walk",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:21881.1,gfa:45951.0,bids:2,tenderer:"SNC2 Realty Pte. Ltd.,\nApex Asia Alpha Investment Two Pte. L",price:504515000.0,psmGfa:10979.41,awardDate:"2025-01-21"},
{location:"Tengah Garden Avenue",area:"Tengah",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:25458.4,gfa:76376.0,bids:3,tenderer:"Intrepid Investments Pte. Ltd.,\nCSC Land Group (Singapore) P",price:675000000.0,psmGfa:8837.85,awardDate:"2025-01-21"},
{location:"Faber Walk",area:"Clementi",devtType:"Residential",lease:99,siteArea:25795.4,gfa:36114.0,bids:3,tenderer:"GuocoLand (Singapore) Pte. Ltd., TID Residential Pte. Ltd. a",price:349857988.0,psmGfa:9687.6,awardDate:"2024-11-26"},
{location:"Margaret Drive",area:"Queenstown",devtType:"Residential",lease:99,siteArea:9522.3,gfa:39994.0,bids:2,tenderer:"Intrepid Investments Pte. Ltd., Hong Realty (Private) Limite",price:497000000.0,psmGfa:12426.86,awardDate:"2024-08-07"},
{location:"Zion Road (Parcel B)",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:9285.9,gfa:52002.0,bids:2,tenderer:"Valerian Residential Pte. Ltd.",price:730088888.0,psmGfa:14039.63,awardDate:"2024-08-07"},
{location:"Canberra Crescent",area:"Sembawang",devtType:"Residential",lease:99,siteArea:20435.8,gfa:32698.0,bids:3,tenderer:"Peak Nature Pte Ltd and Huatland Development Pte. Ltd.",price:279000800.0,psmGfa:8532.66,awardDate:"2024-08-07"},
{location:"De Souza Avenue",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:19245.4,gfa:30793.0,bids:2,tenderer:"SL Capital (8) Pte Ltd",price:278900000.0,psmGfa:9057.25,awardDate:"2024-08-07"},
{location:"River Valley Green (Parcel A)",area:"River Valley",devtType:"Residential",lease:99,siteArea:9293.3,gfa:32527.0,bids:2,tenderer:"Winchamp Investment Pte. Ltd.",price:463999999.0,psmGfa:14265.07,awardDate:"2024-06-27"},
{location:"Holland Drive",area:"Queenstown",devtType:"Residential",lease:99,siteArea:12388.0,gfa:58224.0,bids:3,tenderer:"Holly Development Pte. Ltd.",price:805390000.0,psmGfa:13832.61,awardDate:"2024-05-20"},
{location:"Zion Road (Parcel A)",area:"Bukit Merah",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:15277.9,gfa:85557.0,bids:1,tenderer:"CDL-MFA Vega Property Pte. Ltd. and CDL-MFA Altair Property ",price:1106888000.0,psmGfa:12937.43,awardDate:"2024-04-16"},
{location:"Upper Thomson Road (Parcel B)",area:"Yishun",devtType:"Residential",lease:99,siteArea:32023.7,gfa:80060.0,bids:1,tenderer:"GuocoLand (Singapore) Pte. Ltd. and Intrepid Investments Pte",price:779555000.0,psmGfa:9737.13,awardDate:"2024-04-16"},
{location:"Orchard Boulevard",area:"River Valley",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:7031.4,gfa:24610.0,bids:4,tenderer:"United Venture Development (No.7) Pte. Ltd.",price:428280980.0,psmGfa:17402.72,awardDate:"2024-02-21"},
{location:"Media Circle",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:10632.1,gfa:30834.0,bids:3,tenderer:"CNQC Realty (Clementi) Pte. Ltd. and Forsea Residence Pte. L",price:395288889.0,psmGfa:12819.9,awardDate:"2024-02-08"},
{location:"Clementi Avenue 1",area:"Clementi",devtType:"Residential",lease:99,siteArea:13451.1,gfa:47079.0,bids:6,tenderer:"CSC Land Group (Singapore) Pte. Ltd. and Caspian Residential",price:633447945.0,psmGfa:13455.0,awardDate:"2023-11-15"},
{location:"Pine Grove (Parcel B)",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:25039.2,gfa:52583.0,bids:3,tenderer:"Golden Ray Edge 3 Pte. Ltd.",price:692388000.0,psmGfa:13167.53,awardDate:"2023-11-15"},
{location:"Lorong 1 Toa Payoh",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:15743.0,gfa:66121.0,bids:3,tenderer:"CDL Constellation Pte. Ltd., Frasers Property Phoenix Pte. L",price:968000000.0,psmGfa:14639.83,awardDate:"2023-11-15"},
{location:"Champions Way",area:"Woodlands",devtType:"Residential",lease:99,siteArea:14432.5,gfa:30309.0,bids:6,tenderer:"CDL Stellar Pte. Ltd.",price:294889000.0,psmGfa:9729.42,awardDate:"2023-09-18"},
{location:"Lentor Central",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:14703.2,gfa:41169.0,bids:2,tenderer:"Intrepid Investments Pte. Ltd., GuocoLand (Singapore) Pte. L",price:435166426.0,psmGfa:10570.25,awardDate:"2023-09-18"},
{location:"Jalan Tembusu",area:"Marine Parade",devtType:"Residential",lease:99,siteArea:20572.1,gfa:72003.0,bids:2,tenderer:"Sim Lian Land Pte Ltd and Sim Lian Development Pte Ltd",price:828800000.0,psmGfa:11510.63,awardDate:"2023-08-10"},
{location:"Marina Gardens Lane",area:"Marina South",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:12245.1,gfa:68573.0,bids:4,tenderer:"Kingsford Huray Development Pte. Ltd., \nObsidian Development",price:1034480000.0,psmGfa:15085.82,awardDate:"2023-07-11"},
{location:"Lentor Gardens",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:21866.7,gfa:45921.0,bids:1,tenderer:"GuocoLand (Singapore) Pte. Ltd. and Intrepid Investments Pte",price:486800222.0,psmGfa:10600.82,awardDate:"2023-04-13"},
{location:"Bukit Timah Link",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:4611.1,gfa:13834.0,bids:5,tenderer:"Bukit One Pte. Ltd.",price:200001888.0,psmGfa:14457.27,awardDate:"2022-11-15"},
{location:"Hillview Rise",area:"Bukit Batok",devtType:"Residential",lease:99,siteArea:10395.2,gfa:29107.0,bids:4,tenderer:"Far East Civil Engineering (Pte.) Limited and Sekisui House,",price:320777000.0,psmGfa:11020.61,awardDate:"2022-11-15"},
{location:"Lentor Hills Road (Parcel B)",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:10819.0,gfa:22720.0,bids:2,tenderer:"TID Residential Pte. Ltd.",price:276360000.0,psmGfa:12163.73,awardDate:"2022-09-19"},
{location:"Lentor Central",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:13444.3,gfa:40333.0,bids:3,tenderer:"Forsea Residence Pte. Ltd., Soilbuild GroupHoldings Ltd. and",price:481028300.0,psmGfa:11926.42,awardDate:"2022-09-19"},
{location:"Dunman Road",area:"Marine Parade",devtType:"Residential",lease:99,siteArea:25234.3,gfa:88321.0,bids:2,tenderer:"Sing-Haiyi Jade Pte. Ltd.",price:1283888998.0,psmGfa:14536.62,awardDate:"2022-06-14"},
{location:"Pine Grove (Parcel A)",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:22534.7,gfa:47323.0,bids:5,tenderer:"United Venture Development (No. 5) Pte. Ltd.",price:671500800.0,psmGfa:14189.73,awardDate:"2022-06-14"},
{location:"Dairy Farm Walk",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:15663.2,gfa:32893.0,bids:7,tenderer:"Sim Lian Land Pte Ltd and Sim Lian Development Pte Ltd",price:347001000.0,psmGfa:10549.39,awardDate:"2022-03-11"},
{location:"Jalan Tembusu",area:"Marine Parade",devtType:"Residential",lease:99,siteArea:19567.4,gfa:54789.0,bids:8,tenderer:"CDL Triton Pte. Ltd.",price:768000000.0,psmGfa:14017.41,awardDate:"2022-01-26"},
{location:"Lentor Hills Road (Parcel A)",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:17136.9,gfa:51411.0,bids:4,tenderer:"Intrepid Investments Pte. Ltd., GuocoLand (Singapore) Pte. L",price:586591288.0,psmGfa:11409.84,awardDate:"2022-01-26"},
{location:"Slim Barracks Rise (Parcel A)",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:7957.3,gfa:23872.0,bids:10,tenderer:"EL Development Pte Ltd",price:320100000.0,psmGfa:13409.01,awardDate:"2021-10-11"},
{location:"Slim Barracks Rise (Parcel B)",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:5936.6,gfa:12467.0,bids:10,tenderer:"Gao Xiuhua",price:162388000.0,psmGfa:13025.43,awardDate:"2021-10-11"},
{location:"Lentor Central",area:"Ang Mo Kio",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:17279.9,gfa:60480.0,bids:9,tenderer:"GLL D Pte. Ltd.",price:784113000.0,psmGfa:12964.83,awardDate:"2021-07-29"},
{location:"Ang Mo Kio Avenue 1",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:12679.4,gfa:31699.0,bids:15,tenderer:"United Venture Development (2021) Pte. Ltd.",price:381381000.0,psmGfa:12031.33,awardDate:"2021-06-02"},
{location:"Northumberland Road",area:"Kallang",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:8732.9,gfa:36679.0,bids:10,tenderer:"Maximus Residential SG Pte. Ltd. and Maximus Commercial SG P",price:445888000.0,psmGfa:12156.49,awardDate:"2021-05-05"},
{location:"Tanah Merah Kechil Link",area:"Bedok",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:8880.0,gfa:24864.0,bids:15,tenderer:"MCC Land (Singapore) Pte. Ltd.",price:248990000.0,psmGfa:10014.08,awardDate:"2020-11-13"},
{location:"Canberra Drive (Parcel A)",area:"Sembawang",devtType:"Residential",lease:99,siteArea:13315.3,gfa:18642.0,bids:5,tenderer:"Oasis Development Pte. Ltd.",price:129196000.0,psmGfa:6930.37,awardDate:"2020-03-09"},
{location:"Canberra Drive (Parcel B)",area:"Sembawang",devtType:"Residential",lease:99,siteArea:27566.1,gfa:38593.0,bids:4,tenderer:"United Venture Development (2020) Pte. Ltd.",price:270200000.0,psmGfa:7001.27,awardDate:"2020-03-09"},
{location:"Irwell Bank Road",area:"River Valley",devtType:"Residential",lease:99,siteArea:12786.5,gfa:35803.0,bids:7,tenderer:"CDL Perseus Pte. Ltd.",price:583888000.0,psmGfa:16308.35,awardDate:"2020-01-14"},
{location:"Jalan Bunga Rampai",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:4666.6,gfa:9800.0,bids:9,tenderer:"Wee Hur Development Pte Ltd",price:93390000.0,psmGfa:9529.59,awardDate:"2020-01-14"},
{location:"Tan Quee Lan Street",area:"Downtown Core",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:11530.8,gfa:48430.0,bids:2,tenderer:"GLL D Pte. Ltd., Intrepid Investments Pte. Ltd. and Hong Rea",price:800190000.0,psmGfa:16522.61,awardDate:"2019-09-12"},
{location:"Bernam Street",area:"Downtown Core",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:3846.2,gfa:28001.0,bids:4,tenderer:"HY Realty Pte. Ltd.",price:440900000.0,psmGfa:15745.87,awardDate:"2019-09-12"},
{location:"one-north Gateway",area:"Queenstown",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:5778.7,gfa:14447.0,bids:9,tenderer:"TID Residential Pte. Ltd.",price:155738074.0,psmGfa:10779.96,awardDate:"2019-09-12"},
{location:"Clementi Avenue 1",area:"Clementi",devtType:"Residential",lease:99,siteArea:16542.7,gfa:57900.0,bids:5,tenderer:"UOL Venture Investments Pte. Ltd. and UIC Homes Pte. Ltd.",price:491300000.0,psmGfa:8485.32,awardDate:"2019-07-09"},
{location:"Sims Drive",area:"Geylang",devtType:"Residential",lease:99,siteArea:16225.2,gfa:48676.0,bids:5,tenderer:"Intrepid Investments Pte. Ltd. and CDL Constellation Pte. Lt",price:383529936.0,psmGfa:7879.24,awardDate:"2019-04-05"},
{location:"Middle Road",area:"Downtown Core",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:7462.6,gfa:31343.0,bids:10,tenderer:"Wingcharm Investment Pte. Ltd.",price:491999999.0,psmGfa:15697.28,awardDate:"2019-04-05"},
{location:"Kampong Java Road",area:"Novena",devtType:"Residential",lease:99,siteArea:11643.3,gfa:32602.0,bids:7,tenderer:"CELH Development Pte. Ltd.",price:418380000.0,psmGfa:12833.35,awardDate:"2019-01-21"},
{location:"Dairy Farm Road",area:"Bukit Panjang",devtType:"Residential with commercial at 1st storey",lease:99,siteArea:19647.7,gfa:41261.0,bids:5,tenderer:"UED Residential Pte. Ltd",price:368800001.0,psmGfa:8938.22,awardDate:"2018-09-07"},
{location:"Jalan Jurong Kechil",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:14234.9,gfa:19929.0,bids:3,tenderer:"COHL Singapore Pte. Limited and CSC Land Group (Singapore) P",price:215000000.0,psmGfa:10788.3,awardDate:"2018-09-07"},
{location:"Hillview Rise",area:"Bukit Batok",devtType:"Residential",lease:99,siteArea:14296.1,gfa:40030.0,bids:9,tenderer:"Intrepid Investments Pte. Ltd. and Garden Estates (Pte) Limi",price:460000000.0,psmGfa:11491.38,awardDate:"2018-07-03"},
{location:"Cuscaden Road",area:"Orchard",devtType:"Residential",lease:99,siteArea:5722.5,gfa:16023.0,bids:9,tenderer:"Amberden Pte Ltd, FEC Properties Pte Ltd and Orchard Square ",price:409999999.99,psmGfa:25588.22,awardDate:"2018-05-17"},
{location:"Mattar Road",area:"Geylang",devtType:"Residential",lease:99,siteArea:6230.2,gfa:18691.0,bids:10,tenderer:"FSKH Development Pte Ltd",price:223019000.0,psmGfa:11931.89,awardDate:"2018-05-17"},
{location:"Silat Avenue",area:"Bukit Merah",devtType:"Residential & Residential with Commercial at 1st Storey",lease:99,siteArea:22851.6,gfa:84551.0,bids:1,tenderer:"UOL Venture Investments Pte. Ltd., UIC Homes Pte. Ltd. and K",price:1035300000.0,psmGfa:12244.68,awardDate:"2018-05-17"},
{location:"Chong Kuo Road",area:"Yishun",devtType:"Residential",lease:99,siteArea:4282.9,gfa:5997.0,bids:8,tenderer:"Lian Soon Holdings Pte. Ltd. and OKP Land Pte Ltd",price:43948000.0,psmGfa:7328.33,awardDate:"2018-02-07"},
{location:"Handy Road / Mount Sophia",area:"Rochor / Museum",devtType:"Residential",lease:99,siteArea:4796.2,gfa:11446.0,bids:10,tenderer:"CDL Regulus Pte. Ltd.",price:212200000.0,psmGfa:18539.23,awardDate:"2018-02-07"},
{location:"West Coast Vale",area:"Clementi",devtType:"Residential",lease:99,siteArea:19591.5,gfa:54857.0,bids:6,tenderer:"CDL Pegasus Pte. Ltd.",price:472400000.0,psmGfa:8611.48,awardDate:"2018-02-07"},
{location:"Fourth Avenue",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:18532.2,gfa:33358.0,bids:7,tenderer:"Allgreen Properties Limited",price:552956000.0,psmGfa:16576.41,awardDate:"2017-12-08"},
{location:"Jiak Kim Street",area:"Singapore River",devtType:"Residential with Commercial at 1st storey",lease:99,siteArea:13481.7,gfa:51231.0,bids:10,tenderer:"FCL Residences Pte. Ltd.",price:955407818.0,psmGfa:18649.02,awardDate:"2017-12-08"},
{location:"Serangoon North Avenue 1",area:"Serangoon",devtType:"Residential",lease:99,siteArea:17189.1,gfa:42973.0,bids:16,tenderer:"Corson Pte. Ltd. and Wingjoy Investment Pte. Ltd.",price:446280000.0,psmGfa:10385.13,awardDate:"2017-08-02"},
{location:"Woodleigh Lane",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:19546.9,gfa:58641.0,bids:15,tenderer:"CEL Unique Development Pte. Ltd.",price:700700700.0,psmGfa:11948.99,awardDate:"2017-07-14"},
{location:"Stirling Road",area:"Queenstown",devtType:"Residential",lease:99,siteArea:21109.5,gfa:88660.0,bids:13,tenderer:"Logan Property (Singapore) Company Pte Ltd and Nanshan Group",price:1002719956.0,psmGfa:11309.72,awardDate:"2017-05-23"},
{location:"Tampines Avenue 10 (Parcel C)",area:"Tampines",devtType:"Residential",lease:99,siteArea:21717.7,gfa:60810.0,bids:9,tenderer:"Bellevue Properties Pte. Ltd.",price:370100000.0,psmGfa:6086.17,awardDate:"2017-05-03"},
{location:"Toh Tuck Road",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:18721.4,gfa:26210.0,bids:24,tenderer:"S P Setia International (S) Pte Ltd",price:265000000.0,psmGfa:10110.64,awardDate:"2017-04-18"},
{location:"West Coast Vale",area:"Clementi",devtType:"Residential",lease:99,siteArea:16378.3,gfa:45860.0,bids:9,tenderer:"China Construction (South Pacific) Developments Co. Pte. Ltd",price:291990000.0,psmGfa:6366.99,awardDate:"2017-02-15"},
{location:"Perumal Road",area:"Kallang",devtType:"Residential with Commercial at 1st storey",lease:99,siteArea:3847.8,gfa:16161.0,bids:11,tenderer:"Low Keng Huat (Singapore) Limited",price:174080000.0,psmGfa:10771.61,awardDate:"2017-01-18"},
{location:"Margaret Drive",area:"Queenstown",devtType:"Residential",lease:99,siteArea:4809.8,gfa:22195.0,bids:14,tenderer:"MCL Land (Regency) Pte. Ltd.",price:238390301.0,psmGfa:10740.72,awardDate:"2016-12-12"},
{location:"Fernvale Road",area:"Sengkang",devtType:"Residential",lease:99,siteArea:17195.9,gfa:51588.0,bids:14,tenderer:"Sing Development (Private) Limited and Wee Hur Development P",price:287100000.0,psmGfa:5565.25,awardDate:"2016-09-30"},
{location:"Martin Place",area:"River Valley",devtType:"Residential",lease:99,siteArea:15936.1,gfa:44622.0,bids:13,tenderer:"First Bedok Land Pte Ltd",price:595100000.0,psmGfa:13336.47,awardDate:"2016-07-01"},
{location:"Jalan Kandis",area:"Sembawang",devtType:"Residential",lease:99,siteArea:7045.6,gfa:9864.0,bids:9,tenderer:"Dillenia Land Pte. Ltd.",price:51070228.0,psmGfa:5177.44,awardDate:"2016-04-13"},
{location:"New Upper Changi Road / Bedok South Avenue 3",area:"Bedok",devtType:"Residential",lease:99,siteArea:24394.0,gfa:51228.0,bids:8,tenderer:"CEL Residential Development Pte. Ltd.",price:419380000.0,psmGfa:8186.54,awardDate:"2016-02-26"},
{location:"Siglap Road",area:"Bedok",devtType:"Residential",lease:99,siteArea:19309.6,gfa:67584.0,bids:8,tenderer:"FCL Topaz Pte. Ltd., Sekisui House, Ltd. and KH Capital Pte.",price:624180000.0,psmGfa:9235.62,awardDate:"2016-01-18"},
{location:"Clementi Avenue 1",area:"Clementi",devtType:"Residential",lease:99,siteArea:13037.8,gfa:45633.0,bids:6,tenderer:"Singland Homes Pte. Ltd. and UOL Venture Investments Pte. Lt",price:302100000.0,psmGfa:6620.21,awardDate:"2015-12-11"},
{location:"Alexandra View",area:"Bukit Merah",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:8398.5,gfa:41153.0,bids:10,tenderer:"Tang Skyline Pte Ltd",price:376880000.0,psmGfa:9158.02,awardDate:"2015-11-17"},
{location:"Lorong Lew Lian",area:"Serangoon",devtType:"Residential",lease:99,siteArea:14001.5,gfa:42005.0,bids:11,tenderer:"Verwood Holdings Pte. Ltd., Intrepid Investments Pte. Ltd. a",price:321000000.0,psmGfa:7641.95,awardDate:"2015-11-11"},
{location:"West Coast Vale",area:"Clementi",devtType:"Residential",lease:99,siteArea:18908.7,gfa:52945.0,bids:6,tenderer:"EL Development Pte Ltd",price:314100000.0,psmGfa:5932.57,awardDate:"2015-08-13"},
{location:"Tampines Avenue 10",area:"Tampines",devtType:"Residential",lease:99,siteArea:15660.4,gfa:43850.0,bids:12,tenderer:"MCC Land (Singapore) Pte Ltd",price:227780000.0,psmGfa:5194.53,awardDate:"2015-05-04"},
{location:"Sturdee Road",area:"Kallang",devtType:"Residential",lease:99,siteArea:6111.5,gfa:21391.0,bids:16,tenderer:"SL Capital (1) Pte Ltd",price:181189000.0,psmGfa:8470.34,awardDate:"2015-03-31"},
{location:"Jurong West Street 41",area:"Jurong West",devtType:"Residential",lease:99,siteArea:17803.5,gfa:49850.0,bids:9,tenderer:"MCL Land (Vantage) Pte. Ltd.",price:338118000.0,psmGfa:6782.71,awardDate:"2015-03-12"},
{location:"Upper Serangoon Road",area:"Hougang",devtType:"Residential with Commercial at 1st Storey",lease:99,siteArea:10097.1,gfa:30292.0,bids:11,tenderer:"Asset Legend Limited",price:276774000.0,psmGfa:9136.87,awardDate:"2014-11-28"},
{location:"Lorong Puntong",area:"Bishan",devtType:"Residential",lease:99,siteArea:10502.8,gfa:22056.0,bids:18,tenderer:"Nanshan Group Singapore Co. Pte Ltd",price:173570000.0,psmGfa:7869.51,awardDate:"2014-10-13"},
{location:"Fernvale Road",area:"Sengkang",devtType:"Residential",lease:99,siteArea:16603.9,gfa:49812.0,bids:4,tenderer:"CEL Development Pte. Ltd. and Unique Residence Pte. Ltd.",price:234933000.0,psmGfa:4716.39,awardDate:"2014-08-08"},
{location:"Fernvale Road",area:"Sengkang",devtType:"Residential",lease:99,siteArea:17413.9,gfa:52242.0,bids:3,tenderer:"CEL Development Pte. Ltd. and Unique Residence Pte. Ltd.",price:252122000.0,psmGfa:4826.04,awardDate:"2014-08-08"},
{location:"Prince Charles Crescent",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:24964.3,gfa:52426.0,bids:7,tenderer:"UOL Venture Investments Pte. Ltd. and Kheng Leong Company (P",price:463100000.0,psmGfa:8833.4,awardDate:"2014-04-21"},
{location:"Yishun Avenue 9 / Yishun Avenue 6",area:"Yishun",devtType:"Residential",lease:99,siteArea:20553.8,gfa:57551.0,bids:5,tenderer:"EL Development Pte Ltd",price:278800000.0,psmGfa:4844.4,awardDate:"2014-03-13"},
{location:"Geylang East Avenue 1",area:"Geylang",devtType:"Residential",lease:99,siteArea:6238.1,gfa:17467.0,bids:16,tenderer:"S L (Serangoon) Pte Ltd",price:145890000.0,psmGfa:8352.32,awardDate:"2014-01-24"},
{location:"Upper Paya Lebar Road",area:"Serangoon",devtType:"Residential",lease:99,siteArea:20077.6,gfa:56218.0,bids:7,tenderer:"UOL Overseas Investments Pte Ltd",price:392300000.0,psmGfa:6978.19,awardDate:"2014-01-15"},
{location:"Upper Serangoon View",area:"Hougang",devtType:"Residential",lease:99,siteArea:15340.6,gfa:46022.0,bids:8,tenderer:"Kingsford Development Pte Ltd",price:258800000.0,psmGfa:5623.4,awardDate:"2013-12-02"},
{location:"Upper Serangoon View",area:"Hougang",devtType:"Residential",lease:99,siteArea:11951.4,gfa:35855.0,bids:8,tenderer:"Kingsford Development Pte Ltd",price:201630000.0,psmGfa:5623.48,awardDate:"2013-12-02"},
{location:"Mount Sophia",area:"Rochor",devtType:"Residential",lease:99,siteArea:23770.5,gfa:35528.0,bids:9,tenderer:"Hoi Hup Realty Pte Ltd, Sunway Developments Pte Ltd and S C ",price:442280000.0,psmGfa:12448.77,awardDate:"2013-09-12"},
{location:"Tampines Avenue 10",area:"Tampines",devtType:"Residential",lease:99,siteArea:17102.9,gfa:47889.0,bids:10,tenderer:"MCC Land (Singapore) Pte Ltd",price:289700000.0,psmGfa:6049.41,awardDate:"2013-07-19"},
{location:"Faber Walk",area:"Clementi",devtType:"Residential",lease:99,siteArea:15125.4,gfa:21176.0,bids:18,tenderer:"World Class Land Pte Ltd",price:156688000.0,psmGfa:7399.32,awardDate:"2013-06-20"},
{location:"Kim Tian Road",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:10990.6,gfa:43963.0,bids:11,tenderer:"Harvestland Development Pte Ltd",price:550280000.0,psmGfa:12516.89,awardDate:"2013-04-23"},
{location:"Jurong West Street 41",area:"Jurong West",devtType:"Residential",lease:99,siteArea:22357.3,gfa:62601.0,bids:12,tenderer:"MCL Land (Prestige) Pte. Ltd.",price:438888000.0,psmGfa:7010.88,awardDate:"2013-01-31"},
{location:"Ang Mo Kio Avenue 2 / Ang Mo Kio Street 13",area:"Ang Mo Kio",devtType:"Residential",lease:99,siteArea:18482.2,gfa:64688.0,bids:12,tenderer:"Pinehill Investments Pte. Ltd.",price:550000048.0,psmGfa:8502.35,awardDate:"2013-01-09"},
{location:"Alexandra Road / Alexandra View",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:6501.4,gfa:31857.0,bids:6,tenderer:"Singland Homes Pte. Ltd.",price:332680000.0,psmGfa:10442.92,awardDate:"2012-12-17"},
{location:"Jalan Jurong Kechil",area:"Bukit Timah",devtType:"Residential (option for retirement housing is allowed)",lease:60,siteArea:10170.8,gfa:14239.0,bids:23,tenderer:"World Class Developments (North) Pte Ltd",price:73800000.0,psmGfa:5182.95,awardDate:"2012-11-22"},
{location:"New Upper Changi Road / Bedok Road",area:"Bedok",devtType:"Residential",lease:99,siteArea:31881.6,gfa:51011.0,bids:11,tenderer:"Sherwood Development Pte Ltd",price:434550000.0,psmGfa:8518.75,awardDate:"2012-10-22"},
{location:"Dairy Farm Road",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:17545.8,gfa:36847.0,bids:9,tenderer:"First Shine Properties Pte Ltd and Meadows Bright Developmen",price:244318000.0,psmGfa:6630.61,awardDate:"2012-09-25"},
{location:"Prince Charles Crescent / Prince Charles Square",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:23785.4,gfa:49950.0,bids:8,tenderer:"Wingstar Investment Pte. Ltd., Metro Australia Holdings Pte ",price:516298888.0,psmGfa:10336.31,awardDate:"2012-09-25"},
{location:"Pheng Geck Avenue / Tai Thong Crescent",area:"Toa Payoh",devtType:"Residential with Commercial at 1st storey",lease:99,siteArea:8200.3,gfa:28702.0,bids:8,tenderer:"Verwood Holdings Pte. Ltd. and Intrepid Investments Pte. Ltd",price:245000000.0,psmGfa:8535.99,awardDate:"2012-09-07"},
{location:"Farrer Road",area:"Bukit Timah",devtType:"Residential",lease:99,siteArea:2741.5,gfa:3839.0,bids:15,tenderer:"Far East Soho Pte. Ltd.",price:45777000.0,psmGfa:11924.2,awardDate:"2012-09-03"},
{location:"Tanah Merah Kechil Road",area:"Bedok",devtType:"Residential",lease:99,siteArea:13998.5,gfa:39196.0,bids:13,tenderer:"Fragrance Group Limited and World Class Land Pte Ltd",price:285215000.0,psmGfa:7276.64,awardDate:"2012-08-06"},
{location:"Pheng Geck Avenue / Tai Thong Crescent",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:4850.5,gfa:16977.0,bids:13,tenderer:"Santarli Corporation Pte Ltd",price:114800000.0,psmGfa:6762.09,awardDate:"2012-07-04"},
{location:"Farrer Drive",area:"Tanglin",devtType:"Residential",lease:99,siteArea:6268.3,gfa:10030.0,bids:6,tenderer:"Singland Development Pte. Ltd.",price:113200000.0,psmGfa:11286.14,awardDate:"2012-06-27"},
{location:"Buangkok Drive / Sengkang Central",area:"Sengkang",devtType:"Residential",lease:99,siteArea:18340.7,gfa:55023.0,bids:5,tenderer:"White Haven Properties Pte. Ltd.",price:301000000.0,psmGfa:5470.44,awardDate:"2012-06-15"},
{location:"Pasir Ris Drive 3",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:22317.4,gfa:46867.0,bids:5,tenderer:"Capital Development Pte. Ltd.",price:210999000.0,psmGfa:4502.08,awardDate:"2012-06-11"},
{location:"Boon Lay Way",area:"Jurong East",devtType:"Residential",lease:99,siteArea:11588.0,gfa:48670.0,bids:12,tenderer:"MCL Land Limited",price:369388000.0,psmGfa:7589.64,awardDate:"2012-05-31"},
{location:"Tampines Avenue 10",area:"Tampines",devtType:"Residential",lease:99,siteArea:20071.1,gfa:56200.0,bids:3,tenderer:"F.E. Lakeside Pte. Ltd., FCL Topaz Pte. Ltd. and Sekisui Hou",price:252777000.0,psmGfa:4497.81,awardDate:"2012-05-21"},
{location:"Hillview Avenue",area:"Bukit Batok",devtType:"Residential",lease:99,siteArea:12648.5,gfa:35416.0,bids:7,tenderer:"Kingsford Development Pte Ltd",price:243216999.0,psmGfa:6867.43,awardDate:"2012-03-07"},
{location:"Bedok South Avenue 3",area:"Bedok",devtType:"Residential",lease:99,siteArea:28644.5,gfa:60154.0,bids:7,tenderer:"F.E. Lakeside Pte. Ltd., FCL Topaz Pte. Ltd. and Sekisui Hou",price:345900000.0,psmGfa:5750.24,awardDate:"2012-02-14"},
{location:"Jervois Road",area:"Tanglin",devtType:"Residential",lease:99,siteArea:8958.0,gfa:12542.0,bids:17,tenderer:"S.L. Development Pte. Limited",price:118900000.0,psmGfa:9480.15,awardDate:"2012-02-08"},
{location:"Kovan Road / Simon Road",area:"Hougang",devtType:"Residential",lease:99,siteArea:16994.1,gfa:35688.0,bids:11,tenderer:"Hoi Hup Realty Pte Ltd, Investment Focus Pte Ltd and Orienta",price:194600000.0,psmGfa:5452.81,awardDate:"2012-01-26"},
{location:"Mount Vernon Road",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:20810.9,gfa:72839.0,bids:5,tenderer:"Intrepid Investments Pte Ltd, Sunmaster Holdings Pte. Ltd. a",price:388106106.0,psmGfa:5328.27,awardDate:"2012-01-16"},
{location:"Alexandra Road / Alexandra View",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:9952.6,gfa:48768.0,bids:7,tenderer:"Sunmaster Holdings Pte. Ltd., Intrepid Investments Pte. Ltd.",price:396000000.0,psmGfa:8120.08,awardDate:"2011-12-08"},
{location:"Chestnut Avenue",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:18699.4,gfa:39269.0,bids:12,tenderer:"S P Setia International (S) Pte Ltd",price:180000000.0,psmGfa:4583.77,awardDate:"2011-11-30"},
{location:"Flora Drive",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:29949.0,gfa:41929.0,bids:8,tenderer:"Realty Consortium Pte. Ltd",price:163000000.0,psmGfa:3887.52,awardDate:"2011-10-25"},
{location:"Jalan Loyang Besar / Pasir Ris Rise",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:17274.2,gfa:36276.0,bids:13,tenderer:"Hoi Hup Realty Pte Ltd, Sunway Developments Pte. Ltd. and Or",price:140960000.0,psmGfa:3885.76,awardDate:"2011-10-10"},
{location:"Upper Serangoon Road / Pheng Geck Avenue",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:8663.5,gfa:30323.0,bids:15,tenderer:"Clerodendrum Land Pte. Ltd.",price:185168000.0,psmGfa:6106.52,awardDate:"2011-08-15"},
{location:"Choa Chu Kang Road / Phoenix Road",area:"Bukit Batok",devtType:"Residential",lease:99,siteArea:15385.6,gfa:32310.0,bids:5,tenderer:"Far East Civil Engineering (Pte.) Limited and China Construc",price:142777000.0,psmGfa:4418.97,awardDate:"2011-07-04"},
{location:"West Coast Link / West Coast Crescent",area:"Clementi",devtType:"Residential",lease:99,siteArea:12662.7,gfa:35456.0,bids:12,tenderer:"Boo Han Holdings Pte. Ltd.",price:175777000.0,psmGfa:4957.61,awardDate:"2011-06-28"},
{location:"Flora Drive",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:26817.6,gfa:37545.0,bids:4,tenderer:"Frasers Centrepoint Limited",price:131380000.0,psmGfa:3499.27,awardDate:"2011-06-17"},
{location:"Woodlands Avenue 2 / Rosewood Drive",area:"Woodlands",devtType:"Residential",lease:99,siteArea:27380.2,gfa:38333.0,bids:3,tenderer:"Fragrance Group Limited and Aspial Corporation Ltd",price:151500100.0,psmGfa:3952.21,awardDate:"2011-06-10"},
{location:"Sembawang Road / Jalan Sendudok",area:"Sembawang",devtType:"Condominium / Flats (Serviced apartments will not be allowed) or Strata Landed Housing",lease:99,siteArea:27665.5,gfa:38732.0,bids:6,tenderer:"Hao Yuan Investment Pte. Ltd.",price:191800000.0,psmGfa:4951.98,awardDate:"2011-05-30"},
{location:"Jalan Loyang Besar / Pasir Ris Drive 4",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:27054.8,gfa:56816.0,bids:3,tenderer:"MCL Land Limited",price:246100000.0,psmGfa:4331.53,awardDate:"2011-05-12"},
{location:"Bartley Road / Lorong How Sun",area:"Serangoon",devtType:"Residential",lease:99,siteArea:22094.4,gfa:61865.0,bids:8,tenderer:"Intrepid Investments Pte Ltd, Sunmaster Holdings Pte. Ltd. a",price:413270270.0,psmGfa:6680.2,awardDate:"2011-04-01"},
{location:"Bedok Reservoir Road",area:"Bedok",devtType:"Residential",lease:99,siteArea:45622.9,gfa:63873.0,bids:8,tenderer:"United Venture Development Pte. Ltd.",price:320000000.0,psmGfa:5009.94,awardDate:"2011-03-04"},
{location:"Seletar Road",area:"Serangoon",devtType:"Residential",lease:99,siteArea:17455.9,gfa:24439.0,bids:11,tenderer:"Asplenium Land Pte. Ltd.",price:123000000.0,psmGfa:5032.94,awardDate:"2010-12-16"},
{location:"Punggol Central / Punggol Walk",area:"Punggol",devtType:"Residential",lease:99,siteArea:27527.2,gfa:82999.0,bids:7,tenderer:"Sim Lian Land Pte Ltd & Sim Lian Development Pte Ltd",price:363000000.0,psmGfa:4373.55,awardDate:"2010-12-10"},
{location:"Petir Road",area:"Bukit Panjang",devtType:"Residential",lease:99,siteArea:22744.1,gfa:47763.0,bids:9,tenderer:"Wincheer Investment Pte. Ltd.",price:177396000.0,psmGfa:3714.09,awardDate:"2010-10-11"},
{location:"Jalan Eunos",area:"Bedok",devtType:"Residential",lease:99,siteArea:41261.2,gfa:57766.0,bids:5,tenderer:"Tuas Technology Park Pte Ltd & OPH Marymount Limited",price:257777000.0,psmGfa:4462.43,awardDate:"2010-09-08"},
{location:"Upper Serangoon Road / Pheng Geck Avenue",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:4971.8,gfa:17402.0,bids:15,tenderer:"Qingdao Construction (Singapore) Pte Ltd",price:113737000.0,psmGfa:6535.86,awardDate:"2010-06-15"},
{location:"Hougang Avenue 2",area:"Hougang",devtType:"Residential",lease:99,siteArea:30195.5,gfa:42274.0,bids:7,tenderer:"MCL Land (Serangoon) Pte Ltd",price:207500000.0,psmGfa:4908.45,awardDate:"2010-05-25"},
{location:"Simei Street 3",area:"Tampines",devtType:"Residential",lease:99,siteArea:11793.0,gfa:27124.0,bids:18,tenderer:"CEL Development Pte Ltd",price:152688000.0,psmGfa:5629.26,awardDate:"2010-05-14"},
{location:"Boon Lay Way / Lakeside Drive",area:"Jurong West",devtType:"Residential",lease:99,siteArea:16117.2,gfa:56411.0,bids:14,tenderer:"Keppel Land (Mayfair) Pte Ltd",price:302980000.0,psmGfa:5370.94,awardDate:"2010-05-06"},
{location:"Upper Changi Road North / Flora Drive",area:"Pasir Ris",devtType:"Residential",lease:99,siteArea:30678.7,gfa:42951.0,bids:6,tenderer:"Tripartite Developers Pte Ltd",price:148300000.0,psmGfa:3452.77,awardDate:"2010-04-30"},
{location:"Tampines Avenue 1 / Avenue 10",area:"Tampines",devtType:"Residential",lease:99,siteArea:31740.4,gfa:66655.0,bids:8,tenderer:"Sim Lian Land Pte Ltd",price:302000000.0,psmGfa:4530.79,awardDate:"2010-03-19"},
{location:"Choa Chu Kang Road / Woodlands Road",area:"Choa Chu Kang",devtType:"Flats or serviced apartments with existing commercial development",lease:99,siteArea:15645.2,gfa:34893.085,bids:8,tenderer:"Dollar Land Singapore Private Limited",price:163999999.99,psmGfa:4700.07,awardDate:"2010-02-24"},
{location:"Upper Thomson Road",area:"Bishan",devtType:"Residential",lease:99,siteArea:20847.7,gfa:43781.0,bids:6,tenderer:"Treasure Well Investments Limited",price:251338668.0,psmGfa:5740.82,awardDate:"2009-11-09"},
{location:"Serangoon Avenue 3",area:"Serangoon",devtType:"Residential",lease:99,siteArea:13877.2,gfa:38857.0,bids:15,tenderer:"Intrepid Investments Pte. Ltd.",price:221207207.0,psmGfa:5692.85,awardDate:"2009-10-09"},
{location:"Dakota Crescent",area:"Geylang",devtType:"Residential",lease:99,siteArea:17189.7,gfa:60164.0,bids:13,tenderer:"UOL Development (Novena) Pte. Ltd.",price:329000800.0,psmGfa:5468.4,awardDate:"2009-09-09"},
{location:"New Upper Changi Road / Tanah Merah Kechil Avenue",area:"Bedok",devtType:"Residential",lease:99,siteArea:9875.5,gfa:27652.0,bids:7,tenderer:"TID Pte. Ltd.",price:84000000.0,psmGfa:3037.75,awardDate:"2008-09-10"},
{location:"Woodleigh Close",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:10773.9,gfa:30167.0,bids:6,tenderer:"Frasers Centrepoint Limited",price:87680000.0,psmGfa:2906.49,awardDate:"2008-06-25"},
{location:"Choa Chu Kang Drive",area:"Choa Chu Kang",devtType:"Residential",lease:99,siteArea:19000.0,gfa:53200.0,bids:5,tenderer:"Tian Hock Properties Pte Ltd",price:116010000.0,psmGfa:2180.64,awardDate:"2008-05-28"},
{location:"West Coast Crescent",area:"Clementi",devtType:"Residential",lease:99,siteArea:12000.0,gfa:33600.0,bids:12,tenderer:"Billion Rise Limited",price:110440000.0,psmGfa:3286.9,awardDate:"2008-03-28"},
{location:"Simei Street 4",area:"Tampines",devtType:"Residential",lease:99,siteArea:32210.5,gfa:74084.0,bids:3,tenderer:"UOL Group Limited & Peak Century Pte. Ltd.",price:236050000.0,psmGfa:3186.25,awardDate:"2008-01-08"},
{location:"Alexandra Road / Alexandra View",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:8558.9,gfa:41939.0,bids:6,tenderer:"Winglow Investment Pte.Ltd. & Greatearth Developments Pte Lt",price:288380000.0,psmGfa:6876.18,awardDate:"2007-12-28"},
{location:"Boon Lay Way / Lakeside Drive",area:"Jurong West",devtType:"Residential",lease:99,siteArea:22000.9,gfa:77003.0,bids:2,tenderer:"Frasers Centrepoint Limited",price:205560000.0,psmGfa:2669.51,awardDate:"2007-12-17"},
{location:"Enggor Street",area:"Downtown Core",devtType:"Residential with Commercial at 1st storey",lease:99,siteArea:2788.1,gfa:23420.0,bids:3,tenderer:"Allgreen Properties Limited",price:180800000.0,psmGfa:7719.9,awardDate:"2007-11-20"},
{location:"Enggor Street",area:"Downtown Core",devtType:"Residential with Commercial at 1st storey",lease:99,siteArea:3036.2,gfa:25504.0,bids:2,tenderer:"Bishan Properties Pte Ltd",price:233800000.0,psmGfa:9167.19,awardDate:"2007-11-09"},
{location:"Simon Road",area:"Hougang",devtType:"Condominium or Flats (Serviced apartments will be allowed)",lease:99,siteArea:17634.1,gfa:61719.0,bids:6,tenderer:"Duke Development Pte Ltd",price:290018888.0,psmGfa:4699.02,awardDate:"2007-10-03"},
{location:"Woodsville Close",area:"Toa Payoh",devtType:"Residential",lease:99,siteArea:3870.5,gfa:10837.0,bids:8,tenderer:"Frasers Centrepoint Limited",price:50680000.0,psmGfa:4676.57,awardDate:"2007-07-19"},
{location:"Handy Road",area:"Museum",devtType:"Residential or Residential with Commercial at 1st Storey only",lease:99,siteArea:3585.9,gfa:10041.0,bids:4,tenderer:"Allgreen Properties Limited",price:72300000.0,psmGfa:7200.48,awardDate:"2007-03-30"},
{location:"Sinaran Drive",area:"Novena",devtType:"Residential",lease:99,siteArea:12468.4,gfa:43639.0,bids:4,tenderer:"Frasers Centrepoint Limited",price:238000000.0,psmGfa:5453.84,awardDate:"2006-07-25"},
{location:"Tanah Merah Kechil Avenue",area:"Bedok",devtType:"Condominium or Flats",lease:99,siteArea:21876.8,gfa:61255.0,bids:7,tenderer:"ChoiceHomes Investments Pte Ltd & Wincharm Investment Pte. L",price:210000000.0,psmGfa:3428.29,awardDate:"2006-04-13"},
{location:"Alexandra Road / Tiong Bahru Road",area:"Bukit Merah",devtType:"Residential",lease:99,siteArea:9742.0,gfa:47735.8,bids:12,tenderer:"CRL Realty Pte Ltd  and Lippo Group International Pte Limite",price:179988000.0,psmGfa:3770.5,awardDate:"2005-11-21"},
{location:"Handy Road",area:"Museum",devtType:"Residential or Residential with Commercial at 1st Storey only",lease:99,siteArea:1181.4,gfa:3308.0,bids:6,tenderer:"Lam Kong Yin Patrick",price:12300000.0,psmGfa:3718.26,awardDate:"2004-11-26"},
{location:"Flower Road / Kovan Road",area:"Hougang",devtType:"Condominium; Flats; or Serviced Apartments",lease:99,siteArea:25272.5,gfa:88454.0,bids:7,tenderer:"Winwill Investment Pte Ltd, NTUC Choice Homes Co-operative L",price:255000000.0,psmGfa:2882.85,awardDate:"2003-10-27"},
{location:"Jellicoe Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:14595.2,gfa:61300.0,bids:3,tenderer:"Woodsvale Land Pte Ltd",price:161500000.0,psmGfa:2634.58,awardDate:"2003-10-08"},
{location:"Mount Faber Road",area:"Bukit Merah",devtType:"Condominium or Flats and/or Serviced Apartments",lease:99,siteArea:10560.1,gfa:22176.0,bids:6,tenderer:"Sim Lian Land Pte Ltd",price:68100000.0,psmGfa:3070.89,awardDate:"2002-09-05"},
{location:"Boon Lay Way / Jurong West Street 51",area:"Jurong West",devtType:"Condominium / Flats / Serviced Apartments",lease:99,siteArea:27000.0,gfa:94500.0,bids:6,tenderer:"Tanglin View Pte Ltd",price:200018000.0,psmGfa:2116.59,awardDate:"2002-08-26"},
{location:"Lengkong Empat",area:"Bedok",devtType:"Apartment",lease:99,siteArea:2935.9,gfa:6165.0,bids:2,tenderer:"Tanglin View Pte Ltd",price:11120000.0,psmGfa:1803.73,awardDate:"2002-05-14"},
{location:"Gopeng Street",area:"Downtown Core",devtType:"Residential with option for Commercial\u00a0on first storey only",lease:99,siteArea:6566.6,gfa:55159.0,bids:1,tenderer:"Kentish Court Pte Ltd",price:125280000.0,psmGfa:2271.25,awardDate:"2001-11-01"},
{location:"Boon Lay Way / Corporation Road",area:"Jurong West",devtType:"Condominium / Apartment",lease:99,siteArea:17000.0,gfa:51000.0,bids:3,tenderer:"Centrepoint Properties Ltd",price:106000889.0,psmGfa:2078.45,awardDate:"2001-08-01"},
{location:"Marine Parade Road",area:"Marine Parade",devtType:"Condominium or Flats and/or Serviced Apartments",lease:99,siteArea:24661.8,gfa:69053.0,bids:7,tenderer:"Centrepoint Properties Ltd",price:208120338.0,psmGfa:3013.92,awardDate:"2001-04-27"},
{location:"Joo Chiat Place / Everitt Road",area:"Geylang",devtType:"Condominium / Apartment / Mixed Landed Housing",lease:99,siteArea:8356.8,gfa:11700.0,bids:2,tenderer:"Hoi Hup Realty Pte Ltd & Jihe Development Pte Ltd",price:20233000.0,psmGfa:1729.32,awardDate:"2001-03-08"},
{location:"Mount Sinai Drive",area:"Bukit Timah",devtType:"Condominium / Apartment",lease:99,siteArea:6432.7,gfa:13509.0,bids:7,tenderer:"Winbliss Investment Pte Ltd",price:39118000.0,psmGfa:2895.7,awardDate:"2001-03-08"},
{location:"Kim Keat Road",area:"Novena",devtType:"Apartment",lease:99,siteArea:1164.1,gfa:3259.0,bids:4,tenderer:"C.G.H. Development Pte Ltd",price:6010000.0,psmGfa:1844.12,awardDate:"2000-11-10"},
{location:"Lorong 27A Geylang",area:"Geylang",devtType:"Apartment",lease:99,siteArea:4707.4,gfa:13181.0,bids:2,tenderer:"Hoi Hup JV Development Pte Ltd",price:24680000.0,psmGfa:1872.39,awardDate:"2000-11-10"},
{location:"Lorong 27 Geylang",area:"Geylang",devtType:"Apartment",lease:99,siteArea:4815.3,gfa:13483.0,bids:2,tenderer:"Evan Lim & Co Pte Ltd",price:26888000.0,psmGfa:1994.21,awardDate:"2000-07-11"},
{location:"Upper Serangoon Road",area:"Serangoon",devtType:"Condominium",lease:99,siteArea:18843.7,gfa:52762.0,bids:6,tenderer:"DBS Realty Pte Ltd",price:162500000.0,psmGfa:3079.87,awardDate:"2000-07-11"},
{location:"Bukit Batok East Avenue 2",area:"Bukit Batok",devtType:"Condominium",lease:99,siteArea:22737.9,gfa:63666.0,bids:5,tenderer:"Marina Green Ltd",price:163109000.0,psmGfa:2561.95,awardDate:"2000-03-23"},
{location:"Jalan Pari Dedap",area:"Bedok",devtType:"Condominium",lease:99,siteArea:12890.3,gfa:32226.0,bids:9,tenderer:"DBS Realty (Pte) Ltd",price:91228999.0,psmGfa:2830.91,awardDate:"2000-03-23"},
{location:"Rosewood Drive / Woodlands Avenue 1",area:"Woodlands",devtType:"Condominium",lease:99,siteArea:24802.3,gfa:52085.0,bids:9,tenderer:"Centrepoint Properties Ltd",price:126800000.0,psmGfa:2434.48,awardDate:"2000-03-23"},
{location:"Hougang Street 11",area:"Hougang",devtType:"Condominium",lease:99,siteArea:4573.71,gfa:12806.39,bids:5,tenderer:"Erishi Holdings Pte Ltd",price:23580000.0,psmGfa:1841.27,awardDate:"1997-12-22"},
{location:"Beatty Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:17012.5,gfa:59544.0,bids:3,tenderer:"Allgreen Properties Ltd & Hoe Seng Company (Pte) Ltd",price:161880000.0,psmGfa:2718.66,awardDate:"1997-11-04"},
{location:"Jalan Mata Ayer",area:"Mandai",devtType:"Condominium / Mixed Landed housing",lease:99,siteArea:26383.6,gfa:36937.0,bids:5,tenderer:"Centrepoint Properties Ltd",price:64910000.0,psmGfa:1757.32,awardDate:"1997-11-04"},
{location:"Lorong Ong Lye",area:"Serangoon",devtType:"Condominium / Mixed Landed housing",lease:99,siteArea:8348.3,gfa:11688.0,bids:4,tenderer:"Tacwealth Investments Pte Ltd",price:20247180.0,psmGfa:1732.3,awardDate:"1997-11-04"},
{location:"Tanah Merah Kechil Road",area:"Bedok",devtType:"Condominium",lease:99,siteArea:9867.0,gfa:27628.0,bids:6,tenderer:"Orchard Terminal Pte Ltd",price:83628000.0,psmGfa:3026.93,awardDate:"1997-11-04"},
{location:"Tanah Merah Kechil Road",area:"Bedok",devtType:"Condominium",lease:99,siteArea:12487.0,gfa:34964.0,bids:6,tenderer:"Orchard Terminal Pte Ltd",price:105838000.0,psmGfa:3027.06,awardDate:"1997-11-04"},
{location:"Tanjong Rhu Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:20919.9,gfa:58576.0,bids:6,tenderer:"Orchard Terminal Pte Ltd",price:174148000.0,psmGfa:2973.03,awardDate:"1997-11-04"},
{location:"Chun Tin Road",area:"Bukit Timah",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:6302.2,gfa:8823.0,bids:8,tenderer:"Far East Organization Centre Pte Ltd",price:27359000.0,psmGfa:3100.87,awardDate:"1997-07-28"},
{location:"Draycott Drive",area:"Newton",devtType:"Condominium (with option to conserve existing bungalow)",lease:99,siteArea:14206.6,gfa:29834.0,bids:10,tenderer:"Grandwin Investment Pte Ltd",price:354398000.0,psmGfa:11879.0,awardDate:"1997-07-28"},
{location:"Haig Road / Dunman Road",area:"Geylang",devtType:"Condominium",lease:99,siteArea:6647.7,gfa:18614.0,bids:14,tenderer:"Far East Organization Centre Pte Ltd",price:67729000.0,psmGfa:3638.61,awardDate:"1997-07-28"},
{location:"Newton Road / Lincoln Road",area:"Novena",devtType:"Condominium",lease:99,siteArea:12471.4,gfa:34920.0,bids:10,tenderer:"Winfar Investment Pte Ltd",price:230000000.0,psmGfa:6586.48,awardDate:"1997-07-28"},
{location:"Lorong 39 Geylang",area:"Geylang",devtType:"Apartment",lease:99,siteArea:5669.68,gfa:16102.0,bids:7,tenderer:"LKN Development Pet Ltd",price:44720000.0,psmGfa:2777.29,awardDate:"1997-05-15"},
{location:"Mugliston Park",area:"Hougang",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:21801.5,gfa:30522.0,bids:6,tenderer:"MCL Land Ltd",price:61768000.0,psmGfa:2023.72,awardDate:"1997-05-15"},
{location:"Mugliston Park",area:"Hougang",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:14080.8,gfa:19713.0,bids:9,tenderer:"MCL Land Ltd",price:40318000.0,psmGfa:2045.25,awardDate:"1997-05-15"},
{location:"Bedok Reservoir Road",area:"Bedok",devtType:"Condominium",lease:99,siteArea:27445.08,gfa:57634.67,bids:9,tenderer:"Pidemco Land Ltd",price:161300000.0,psmGfa:2798.66,awardDate:"1997-04-21"},
{location:"Bishan Street 21",area:"Bishan",devtType:"Condominium",lease:99,siteArea:12729.61,gfa:26732.18,bids:7,tenderer:"Victory Realty Co. Pte Ltd",price:116010000.0,psmGfa:4339.71,awardDate:"1997-04-21"},
{location:"Geylang East Avenue 1",area:"Geylang",devtType:"Condominium",lease:99,siteArea:11080.76,gfa:33242.28,bids:9,tenderer:"Victory Realty Company Pte Ltd & Zircon Land Pte Ltd",price:92080000.0,psmGfa:2769.97,awardDate:"1997-04-21"},
{location:"Craig Road ",area:"Outram",devtType:"Residential with commercial at 1st storey only and car park station",lease:99,siteArea:2503.7,gfa:5258.0,bids:13,tenderer:"Guthrie M & E Consultancy (S) Pte Ltd / Asia Life Assurance ",price:25100000.0,psmGfa:4773.68,awardDate:"1997-02-24"},
{location:"Bayshore Road / East Coast Parkway",area:"Bedok",devtType:"Condominium",lease:99,siteArea:39701.7,gfa:138956.0,bids:9,tenderer:"Japura Pte. Ltd.",price:682800000.0,psmGfa:4913.79,awardDate:"1997-02-04"},
{location:"Tanjong Rhu Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:23586.0,gfa:66041.0,bids:2,tenderer:"First Capital Corporation Ltd",price:203751000.0,psmGfa:3085.22,awardDate:"1996-12-18"},
{location:"Trevose Crescent / Whitley Road",area:"Novena",devtType:"Condominium",lease:99,siteArea:15775.1,gfa:22085.0,bids:7,tenderer:"City Developments Ltd & Trade & Industrial Development (Pte)",price:118800000.0,psmGfa:5379.22,awardDate:"1996-09-16"},
{location:"Bishan Road",area:"Bishan",devtType:"Condominium",lease:99,siteArea:14679.7,gfa:23488.0,bids:16,tenderer:"Kanopy Investment Pte Ltd",price:115358000.0,psmGfa:4911.36,awardDate:"1996-07-12"},
{location:"Eastwood Park",area:"Bedok",devtType:"Condominium",lease:99,siteArea:5391.6,gfa:7548.4,bids:9,tenderer:"Hong Leong Holdings Ltd",price:24368000.0,psmGfa:3228.4,awardDate:"1996-06-10"},
{location:"Eastwood Park",area:"Bedok",devtType:"Flats",lease:99,siteArea:1057.5,gfa:1481.0,bids:6,tenderer:"Tong Joo Aik Construction Pte Ltd",price:3172500.0,psmGfa:2142.13,awardDate:"1996-06-10"},
{location:"Lorong Ong Lye",area:"Serangoon",devtType:"Mixed Landed or Flats",lease:99,siteArea:3964.09,gfa:5550.0,bids:5,tenderer:"Allgreen Properties Ltd and Hoe Seng Co (Pte) Ltd",price:15888000.0,psmGfa:2862.7,awardDate:"1996-06-10"},
{location:"Marymount Road",area:"Bishan",devtType:"Condominium",lease:99,siteArea:12803.46,gfa:26887.0,bids:14,tenderer:"Orchard Parade Land Pte Ltd",price:105928000.0,psmGfa:3939.75,awardDate:"1996-06-10"},
{location:"Bedok Reservoir Road",area:"Bedok",devtType:"Condominium",lease:99,siteArea:41316.0,gfa:86764.0,bids:5,tenderer:"First Capital Corporation Ltd",price:261496120.0,psmGfa:3013.88,awardDate:"1996-03-15"},
{location:"Bedok Road / Upper Changi Road",area:"Bedok",devtType:"Mixed Landed or Condominium",lease:99,siteArea:7557.0,gfa:10580.0,bids:5,tenderer:"Sing Development (Pte) Ltd",price:36800000.0,psmGfa:3478.26,awardDate:"1996-03-15"},
{location:"Bedok South Avenue 1",area:"Bedok",devtType:"Mixed Landed or Condominium",lease:99,siteArea:21985.0,gfa:30779.0,bids:3,tenderer:"Boo Han Holdings Pte Ltd & DBS Realty (Pte) Ltd",price:122748000.0,psmGfa:3988.04,awardDate:"1996-03-15"},
{location:"Commonwealth Avenue West / Faber Heights",area:"Clementi",devtType:"Mixed Landed or Condominium",lease:99,siteArea:37027.0,gfa:51838.0,bids:5,tenderer:"City Developments Ltd",price:156200000.0,psmGfa:3013.23,awardDate:"1996-03-15"},
{location:"Hillview Avenue / Bukit Batok Town Park",area:"Bukit Batok",devtType:"Condominium",lease:99,siteArea:13047.0,gfa:25050.0,bids:3,tenderer:"Amcol Holdings Ltd",price:63380000.0,psmGfa:2530.14,awardDate:"1996-03-15"},
{location:"Tanjong Rhu Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:10607.0,gfa:29700.0,bids:10,tenderer:"Riverside Walk Pte Ltd",price:120880000.0,psmGfa:4070.03,awardDate:"1996-03-15"},
{location:"Alkaff Quay",area:"Singapore River",devtType:"Flats with option for commercial uses on the 1st storey only",lease:99,siteArea:21481.0,gfa:60147.0,bids:7,tenderer:"Ho Lee Investments (Pte) Ltd",price:290180000.0,psmGfa:4824.51,awardDate:"1995-08-10"},
{location:"Bukit Batok East Avenue 2",area:"Bukit Batok",devtType:"Condominium",lease:99,siteArea:27034.0,gfa:75695.0,bids:5,tenderer:"Ho Lee Investments (Pte) Ltd",price:155631000.0,psmGfa:2056.03,awardDate:"1995-08-10"},
{location:"Eastwood Park Phase 2 (Land Parcel F6)",area:"Bedok",devtType:"Flats",lease:99,siteArea:3623.9,gfa:5073.0,bids:5,tenderer:"Goldvein Pte Ltd",price:16602000.0,psmGfa:3272.62,awardDate:"1995-08-10"},
{location:"Eastwood Park Phase 2 (Land Parcel F7)",area:"Bedok",devtType:"Flats",lease:99,siteArea:2855.7,gfa:3998.0,bids:4,tenderer:"Goldvein Pte Ltd",price:12911000.0,psmGfa:3229.36,awardDate:"1995-08-10"},
{location:"Eastwood Park Phase 2 (Land Parcel F8)",area:"Bedok",devtType:"Flats",lease:99,siteArea:2894.6,gfa:4052.0,bids:5,tenderer:"Goldvein Pte Ltd",price:13128000.0,psmGfa:3239.88,awardDate:"1995-08-10"},
{location:"Eastwood Park Phase 2 (Land Parcel G)",area:"Bedok",devtType:"Flats with commercial uses on the first storey only",lease:99,siteArea:4304.9,gfa:9040.0,bids:4,tenderer:"Ho Bee Developments Pte Ltd",price:23990000.0,psmGfa:2653.76,awardDate:"1995-08-10"},
{location:"Duchess Avenue",area:"Bukit Timah",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:15538.6,gfa:21754.0,bids:10,tenderer:"Winwill Investment Pte Ltd & Winfaith Investment Pte Ltd",price:91230000.0,psmGfa:4193.71,awardDate:"1995-03-27"},
{location:"Duchess Avenue",area:"Bukit Timah",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:13657.0,gfa:19120.0,bids:11,tenderer:"Winwill Investment Pte Ltd & Winfaith Investment Pte Ltd",price:77518000.0,psmGfa:4054.29,awardDate:"1995-03-27"},
{location:"Sunrise Avenue",area:"Ang Mo Kio",devtType:"Condominium / Mixed Landed Housing",lease:99,siteArea:24243.4,gfa:33941.0,bids:1,tenderer:"Winfast Investment Pte Ltd & Windew Investment Pte Ltd",price:55110000.0,psmGfa:1623.7,awardDate:"1995-03-27"},
{location:"Upper Changi Road East",area:"Bedok",devtType:"Condominium (Service Apartment will not be allowed)",lease:99,siteArea:25697.4,gfa:35976.0,bids:2,tenderer:"First Capital Corporation Ltd",price:96726720.0,psmGfa:2688.65,awardDate:"1995-03-27"},
{location:"Eastwood Park Phase 1 (Land Parcel F1)",area:"Bedok",devtType:"Flats",lease:99,siteArea:3304.0,gfa:4626.0,bids:4,tenderer:"Seah  Say Yoong & Chng Gim Huat",price:13087552.0,psmGfa:2829.13,awardDate:"1995-03-24"},
{location:"Eastwood Park Phase 1 (Land Parcel F2)",area:"Bedok",devtType:"Flats",lease:99,siteArea:3055.3,gfa:4277.0,bids:4,tenderer:"Seah  Say Yoong & Chng Gim Huat",price:12102784.0,psmGfa:2829.74,awardDate:"1995-03-24"},
{location:"Jalan Hajijah",area:"Bedok",devtType:"Condominium",lease:99,siteArea:10887.9,gfa:15243.0,bids:7,tenderer:"Bullion Holdings Pte Ltd",price:64218000.0,psmGfa:4212.95,awardDate:"1994-11-15"},
{location:"Jalan Sempadan",area:"Bedok",devtType:"Condominium",lease:99,siteArea:42832.0,gfa:59965.0,bids:5,tenderer:"Bullion Holdings Pte Ltd",price:231800000.0,psmGfa:3865.59,awardDate:"1994-11-15"},
{location:"Lorong 42 Geylang",area:"Geylang",devtType:"Apartment",lease:99,siteArea:7031.9,gfa:19689.0,bids:3,tenderer:"Bullion Holdings Pte Ltd",price:56390000.0,psmGfa:2864.04,awardDate:"1994-11-15"},
{location:"Robertson Quay / Nanson Road",area:"Singapore River",devtType:"Residential / Shopping",lease:99,siteArea:5730.0,gfa:16044.0,bids:5,tenderer:"Cosmopolitan Development Pte Ltd",price:29173221.0,psmGfa:1818.33,awardDate:"1993-11-06"},
{location:"Bayshore Road",area:"Bedok",devtType:"Condominium",lease:99,siteArea:40984.5,gfa:122954.0,bids:9,tenderer:"Victory Realty Co. Pte Ltd",price:161189000.0,psmGfa:1310.97,awardDate:"1993-03-02"},
{location:"Robertson Quay",area:"Singapore River",devtType:"Apartments with shops on 1st storey",lease:99,siteArea:3409.9,gfa:9548.0,bids:6,tenderer:"Victory Realty Co. Pte Ltd",price:16379000.0,psmGfa:1715.44,awardDate:"1993-03-02"},
{location:"Tanjong Rhu Road",area:"Kallang",devtType:"Condominium",lease:99,siteArea:7446.2,gfa:20626.0,bids:10,tenderer:"Hong Leong Holdings Ltd",price:33500000.0,psmGfa:1624.16,awardDate:"1993-03-02"}]


// ─── FETCH ────────────────────────────────────────────────────────────────────
// Calls our own server-side API route (src/app/api/land-bids/route.js), which
// in turn talks to data.gov.sg. Doing it this way avoids browser CORS issues
// and per-visitor rate-limit problems that come from calling data.gov.sg
// directly from the client.
async function fetchFromAPI() {
  const res = await fetch('/api/land-bids')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  return { ec: json.ec, priv: json.priv }
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
const fmt    = n => !n ? '—' : n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : `$${(n/1e6).toFixed(1)}M`
const SQM_TO_SQFT = 10.7639
// Price per sqm of GFA, computed from price/gfa if psmGfa wasn't already supplied
// (some EC fallback rows have psmGfa hardcoded to 0 even though gfa is known).
const gfaPsm = d => d.psmGfa || (d.gfa ? d.price / d.gfa : 0)
// Formats a $/sqm-GFA figure as the PSF PPR figure (price per sq ft per plot ratio)
// that Singapore developers and analysts conventionally quote land bids in.
const fmtPsf = psm => psm ? `$${Math.round(psm / SQM_TO_SQFT).toLocaleString()} psf ppr` : '—'
const s      = (obj) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(';') // inline style helper - not used but kept

const Badge = ({ type, children }) => {
  const styles = {
    EC:       { background:'#fef3c7', color:'#92400e' },
    Private:  { background:'#dbeafe', color:'#1e40af' },
    live:     { background:'#dcfce7', color:'#166534' },
    cached:   { background:'#fef9c3', color:'#713f12' },
    offline:  { background:'#fee2e2', color:'#991b1b' },
  }
  const st = styles[type] || { background:'#f3f4f6', color:'#374151' }
  return (
    <span style={{...st, fontSize:10, padding:'2px 8px', borderRadius:3,
      fontFamily:'DM Mono, monospace', fontWeight:600, display:'inline-block'}}>
      {children}
    </span>
  )
}

const Stat = ({ label, value, sub, color }) => (
  <div style={{background:'#fff', border:`1px solid ${C.rule}`, borderRadius:6,
    padding:'16px 18px', flex:1, borderTop:`3px solid ${color}`, minWidth:0}}>
    <div style={{fontSize:10, fontWeight:600, textTransform:'uppercase',
      letterSpacing:'0.8px', color:C.muted, marginBottom:6}}>{label}</div>
    <div style={{fontSize:22, fontWeight:800, lineHeight:1, fontFamily:'Georgia,serif',
      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{value}</div>
    {sub && <div style={{fontSize:11, color:C.muted, marginTop:5,
      fontFamily:'DM Mono, monospace', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{sub}</div>}
  </div>
)

const Panel = ({ title, badge, meta, children, maxH }) => (
  <div style={{background:'#fff', border:`1px solid ${C.rule}`, borderRadius:6,
    marginBottom:20, overflow:'hidden'}}>
    <div style={{padding:'12px 16px', borderBottom:`1px solid ${C.rule}`,
      display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
      <div style={{fontWeight:700, fontSize:13}}>
        {title}
        {badge !== undefined && (
          <span style={{background:C.ink, color:'#fff', fontFamily:'DM Mono,monospace',
            fontSize:10, padding:'1px 6px', borderRadius:10, marginLeft:6}}>{badge}</span>
        )}
      </div>
      {meta && <div style={{fontFamily:'DM Mono,monospace', fontSize:10, color:C.muted}}>{meta}</div>}
    </div>
    <div style={maxH ? {maxHeight:maxH, overflowY:'auto'} : {}}>{children}</div>
  </div>
)

const Th = ({ children }) => (
  <th style={{fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.7px',
    color:C.muted, padding:'8px 12px', textAlign:'left', background:'#fafaf8',
    borderBottom:`1px solid ${C.rule}`, whiteSpace:'nowrap', position:'sticky', top:0, zIndex:1}}>{children}</th>
)

const Td = ({ children, mono, bold, dim, red, green, style: sx = {} }) => (
  <td style={{padding:'9px 12px', fontSize:12, borderBottom:`1px solid ${C.rule}`,
    fontFamily: mono ? 'DM Mono,monospace' : 'inherit',
    fontWeight: bold ? 600 : 'inherit',
    color: red ? C.accent : green ? C.green : dim ? C.muted : 'inherit', ...sx}}>{children}</td>
)

// Site name plus its eventual marketing/project name underneath, for easier
// consumer reference. data.gov.sg's GLS dataset doesn't include project names
// (these are only assigned once a developer launches sales), so this shows
// "Not yet launched" unless a projectName has been supplied on the record.
const LocCell = ({ name, project, maxWidth }) => (
  <Td bold sx={{ fontSize: 11, ...(maxWidth ? { maxWidth } : {}) }}>
    <div>{name}</div>
    <div style={{ fontSize: 9, fontWeight: 400, color: C.muted, marginTop: 2 }}>
      {project || 'Not yet launched'}
    </div>
  </Td>
)

const BarRow = ({ label, value, max, color, suffix }) => (
  <div style={{display:'flex', alignItems:'center', gap:10, padding:'7px 0',
    borderBottom:`1px solid ${C.rule}`}}>
    <div style={{fontSize:12, fontWeight:500, minWidth:150, flexShrink:0,
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{label}</div>
    <div style={{flex:1, height:5, background:C.rule, borderRadius:3, overflow:'hidden'}}>
      <div style={{height:'100%', borderRadius:3, background:color,
        width:`${Math.min(100, (value/max*100)).toFixed(1)}%`}}/>
    </div>
    <div style={{fontFamily:'DM Mono,monospace', fontSize:11, color:C.muted,
      minWidth:120, textAlign:'right', flexShrink:0}}>{suffix}</div>
  </div>
)

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab,         setTab]         = useState('overview')
  const [ecData,      setEcData]      = useState([])
  const [privData,    setPrivData]    = useState([])
  const [status,      setStatus]      = useState('loading') // loading|live|cached|offline
  const [lastFetched, setLastFetched] = useState('')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [areaFilter,  setAreaFilter]  = useState('')
  const [yearFilter,  setYearFilter]  = useState('')
  const [search,      setSearch]      = useState('')

  const applyData = useCallback((ec, priv, src, ts) => {
    // Merge fallback EC entries not in live data
    const liveEcDates = new Set(ec.map(d => d.awardDate + d.location))
    const merged = [
      ...ec,
      ...FALLBACK_EC.filter(d => !liveEcDates.has(d.awardDate + d.location))
    ]
      .map(d => ({ ...d, projectName: d.projectName || lookupProjectName(d.location, d.awardDate) }))
      .sort((a, b) => b.awardDate.localeCompare(a.awardDate))

    // Same for priv
    const livePrivKeys = new Set(priv.map(d => d.awardDate + d.location))
    const mergedPriv = [
      ...priv,
      ...FALLBACK_PRIV.filter(d => !livePrivKeys.has(d.awardDate + d.location))
    ]
      .map(d => ({ ...d, projectName: d.projectName || lookupProjectName(d.location, d.awardDate) }))
      .sort((a, b) => b.awardDate.localeCompare(a.awardDate))

    setEcData(merged)
    setPrivData(mergedPriv)
    setStatus(src)
    setLastFetched(ts)
  }, [])

  const loadData = useCallback(async (force = false) => {
    setStatus('loading')
    if (!force) {
      try {
        const ts = localStorage.getItem(CACHE_KEY_TS)
        if (ts && Date.now() - parseInt(ts) < CACHE_TTL) {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY_DATA) || 'null')
          if (cached?.ec?.length && cached?.priv?.length) {
            applyData(cached.ec, cached.priv, 'cached',
              new Date(parseInt(ts)).toLocaleString('en-SG', {dateStyle:'medium', timeStyle:'short'}))
            return
          }
        }
      } catch (_) {}
    }
    try {
      const { ec, priv } = await fetchFromAPI()
      if (!ec.length && !priv.length) throw new Error('Empty')
      try {
        localStorage.setItem(CACHE_KEY_DATA, JSON.stringify({ ec, priv }))
        localStorage.setItem(CACHE_KEY_TS,   String(Date.now()))
      } catch (_) {}
      const ts = new Date().toLocaleString('en-SG', {dateStyle:'medium', timeStyle:'short'})
      applyData(ec, priv, 'live', ts)
    } catch (e) {
      console.warn('API failed, using fallback:', e.message)
      applyData([], [], 'offline', '')
    }
  }, [applyData])

  useEffect(() => { loadData() }, [loadData])

  // ── Derived ──
  const ecRecent   = ecData.filter(d => d.awardDate >= '2025-01-01')
  const privRecent = privData.filter(d => d.awardDate >= '2025-01-01')
  const avgOrZero  = arr => arr.length ? arr.reduce((s,d)=>s+d.price,0)/arr.length : 0

  // Region stats
  const ecByArea = {}, privByArea = {}
  ecData.forEach(d => {
    if (!d.planningArea) return
    if (!ecByArea[d.planningArea]) ecByArea[d.planningArea] = { bids:[], psms:[] }
    if (d.price) ecByArea[d.planningArea].bids.push(d.price)
    const psm = gfaPsm(d)
    if (psm) ecByArea[d.planningArea].psms.push(psm)
  })
  privData.forEach(d => {
    if (!d.planningArea) return
    if (!privByArea[d.planningArea]) privByArea[d.planningArea] = { bids:[], psms:[] }
    if (d.price)  privByArea[d.planningArea].bids.push(d.price)
    if (d.psmGfa) privByArea[d.planningArea].psms.push(d.psmGfa)
  })
  const ecAreaList = Object.entries(ecByArea)
    .map(([n,v])=>({name:n,
      avg: v.bids.length ? v.bids.reduce((a,b)=>a+b,0)/v.bids.length : 0,
      avgPsm: v.psms.length ? v.psms.reduce((a,b)=>a+b,0)/v.psms.length : 0,
      count: v.bids.length}))
    .filter(t=>t.avg>0).sort((a,b)=>b.avg-a.avg)
  const privAreaList = Object.entries(privByArea)
    .map(([n,v])=>({name:n,
      avg: v.bids.length ? v.bids.reduce((a,b)=>a+b,0)/v.bids.length : 0,
      avgPsm: v.psms.length ? v.psms.reduce((a,b)=>a+b,0)/v.psms.length : 0,
      count: v.bids.length}))
    .filter(t=>t.avgPsm>0).sort((a,b)=>b.avgPsm-a.avgPsm)
  const maxEcAvg   = ecAreaList.length   ? Math.max(...ecAreaList.map(t=>t.avg))    : 1
  const maxPrivPsm = privAreaList.length ? Math.max(...privAreaList.map(t=>t.avgPsm)) : 1

  // Combined table
  const combined = [
    ...ecData.map(d=>({type:'EC',   name:d.location, project:d.projectName, area:d.planningArea, date:d.awardDate, developer:d.tenderer, price:d.price, psm:gfaPsm(d), bids:d.bids})),
    ...privData.map(d=>({type:'Private', name:d.location, project:d.projectName, area:d.planningArea, date:d.awardDate, developer:d.tenderer, price:d.price, psm:gfaPsm(d), bids:d.bids})),
  ]
  const areas = [...new Set(combined.map(d=>d.area).filter(Boolean))].sort()
  const years = [...new Set(combined.map(d=>d.date?.slice(0,4)).filter(Boolean))].sort().reverse()
  const filtered = combined.filter(d =>
    (typeFilter==='all' || d.type===typeFilter) &&
    (!areaFilter || d.area===areaFilter) &&
    (!yearFilter || d.date?.startsWith(yearFilter)) &&
    (!search || [d.name,d.developer,d.area].some(s=>s&&s.toLowerCase().includes(search.toLowerCase())))
  ).sort((a,b)=>(b.date||'').localeCompare(a.date||''))

  // PSM comparison data
  const psmRows = (() => {
    const ecPsm = {}, prPsm = {}
    ecData.filter(d=>d.awardDate>='2020-01-01'&&gfaPsm(d)>0).forEach(d=>{
      if(!ecPsm[d.planningArea]) ecPsm[d.planningArea]=[]
      ecPsm[d.planningArea].push(gfaPsm(d))
    })
    privData.filter(d=>d.awardDate>='2020-01-01'&&d.psmGfa>0).forEach(d=>{
      if(!prPsm[d.planningArea]) prPsm[d.planningArea]=[]
      prPsm[d.planningArea].push(d.psmGfa)
    })
    const all = [...new Set([...Object.keys(ecPsm),...Object.keys(prPsm)])]
    return all.map(a=>({
      area:a,
      ec: ecPsm[a] ? ecPsm[a].reduce((x,y)=>x+y,0)/ecPsm[a].length : null,
      pr: prPsm[a] ? prPsm[a].reduce((x,y)=>x+y,0)/prPsm[a].length : null,
    })).filter(r=>r.ec||r.pr).sort((a,b)=>(b.pr||0)-(a.pr||0)).slice(0,18)
  })()
  const psmMax = psmRows.length ? Math.max(...psmRows.flatMap(r=>[r.ec||0,r.pr||0])) : 1

  // ── Status banner ──
  const bannerCfg = {
    loading: { bg:'#faf5ff', border:'#c4b5fd', text:'Fetching latest URA data…',          sub:'Connecting to data.gov.sg — takes ~15 seconds on first load' },
    live:    { bg:'#f0fdf4', border:'#86efac', text:`✅ Live data · ${ecData.length} EC + ${privData.length} private sites`, sub:`Fetched ${lastFetched} · Cache refreshes every 24h` },
    cached:  { bg:'#fefce8', border:'#fde68a', text:`🕐 Cached data · ${ecData.length} EC + ${privData.length} private sites`, sub:`From ${lastFetched} · Opens instantly, refreshes every 24h` },
    offline: { bg:'#fff5f5', border:'#fca5a5', text:'⚠️ Offline mode — showing built-in data', sub:'Could not reach data.gov.sg. Tap Refresh to retry.' },
  }
  const bcfg = bannerCfg[status] || bannerCfg.loading

  const navBtn = (id, label) => (
    <button key={id} onClick={()=>setTab(id)} style={{
      fontFamily:'inherit', fontSize:11, fontWeight:500,
      background:'none', border:'none', cursor:'pointer', padding:'11px 18px',
      color: tab===id ? '#fff' : C.muted,
      borderBottom: tab===id ? `2px solid ${C.accent}` : '2px solid transparent',
      textTransform:'uppercase', letterSpacing:'0.3px', whiteSpace:'nowrap'
    }}>{label}</button>
  )

  return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif', background:C.paper,
      minHeight:'100vh', color:C.ink}}>

      {/* ── HEADER ── */}
      <header style={{background:C.ink, color:'#fff', padding:'16px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`3px solid ${C.accent}`, flexWrap:'wrap', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <img src="/logo.jpg" alt="LeeYong Division Collective" width={44} height={44}
            style={{borderRadius:'50%', flexShrink:0}}/>
          <div>
            <div style={{fontWeight:800, fontSize:18, letterSpacing:'-0.4px'}}>
              🏗 SG Residential Land Bids
            </div>
            <div style={{fontSize:11, color:C.muted, marginTop:3, fontFamily:'DM Mono,monospace'}}>
              LeeYong Division Collective · Live · URA GLS via data.gov.sg · Auto-refreshes every 24h
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <span style={{background:'rgba(217,119,6,0.2)', color:'#fbbf24', fontSize:10,
            padding:'4px 10px', borderRadius:12, fontFamily:'DM Mono,monospace',
            border:'1px solid rgba(217,119,6,0.3)'}}>● EC ({ecData.length})</span>
          <span style={{background:'rgba(37,99,235,0.2)', color:'#93c5fd', fontSize:10,
            padding:'4px 10px', borderRadius:12, fontFamily:'DM Mono,monospace',
            border:'1px solid rgba(37,99,235,0.3)'}}>● Private ({privData.length})</span>
          <Badge type={status==='live'?'live':status==='cached'?'cached':'offline'}>
            {status==='live'?'● LIVE':status==='cached'?'● CACHED':status==='loading'?'● LOADING':'● OFFLINE'}
          </Badge>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav style={{background:C.ink, padding:'0 28px', display:'flex',
        borderBottom:'1px solid #1a1a1a', overflowX:'auto'}}>
        {['overview','pipeline','regions','allbids'].map(id =>
          navBtn(id, {overview:'Overview', pipeline:'EC Pipeline', regions:'By Region', allbids:'All Bids'}[id])
        )}
      </nav>

      {/* ── MAIN ── */}
      <main style={{padding:'22px 28px', maxWidth:1400, margin:'0 auto'}}>

        {/* Status banner */}
        <div style={{background:bcfg.bg, border:`1px solid ${bcfg.border}`, borderRadius:8,
          padding:'14px 18px', marginBottom:20, display:'flex',
          alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:13, fontWeight:600}}>{bcfg.text}</div>
            <div style={{fontSize:11, color:C.muted, fontFamily:'DM Mono,monospace', marginTop:3}}>{bcfg.sub}</div>
          </div>
          {status !== 'loading' && (
            <button onClick={()=>loadData(true)} style={{background:'#fff',
              border:`1px solid ${C.rule}`, borderRadius:6, padding:'8px 16px',
              fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'}}>
              🔄 Refresh Now
            </button>
          )}
          {status === 'loading' && (
            <div style={{width:20, height:20, borderRadius:'50%',
              border:'2px solid #c4b5fd', borderTopColor:'#7c3aed',
              animation:'spin 0.8s linear infinite'}}/>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform:rotate(360deg) } }
          * { box-sizing:border-box }
          ::-webkit-scrollbar { width:6px; height:6px }
          ::-webkit-scrollbar-track { background:#f1f0eb }
          ::-webkit-scrollbar-thumb { background:#ccc; border-radius:3px }
          table { border-collapse:collapse; width:100% }
          tr:hover td { background:#fafaf8 }
        `}</style>

        {/* ══ OVERVIEW ══ */}
        {tab==='overview' && <>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22}}>
            <Stat label="EC Sites Total"      value={ecData.length}    sub={`${ecRecent.length} in 2025–26`}     color={C.ecColor}/>
            <Stat label="Private Res Total"   value={privData.length}  sub={`${privRecent.length} in 2025–26`}   color={C.privColor}/>
            <Stat label="EC Avg Bid (All)"    value={fmt(avgOrZero(ecData))}    sub="Historical all-time"        color={C.amber}/>
            <Stat label="Private Avg Bid"     value={fmt(avgOrZero(privData))}  sub="Historical all-time"        color={C.teal}/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20}}>
            <Panel title="🟠 EC — Recent Awards" badge={ecRecent.length} meta="2025–2026">
              <table>
                <thead><tr><Th>Location</Th><Th>Area</Th><Th>Developer</Th><Th>Bid</Th><Th>$psf ppr</Th></tr></thead>
                <tbody>
                  {ecRecent.slice(0,10).map((d,i)=>(
                    <tr key={i} style={{background:'#fffbf0'}}>
                      <LocCell name={d.location} project={d.projectName} maxWidth={160}/>
                      <Td sx={{fontSize:11}}>{d.planningArea}</Td>
                      <Td sx={{fontSize:10, color:C.muted}}>{d.tenderer?.slice(0,35)}</Td>
                      <Td mono>{fmt(d.price)}</Td>
                      <Td mono green={gfaPsm(d)>15000}>{fmtPsf(gfaPsm(d))}</Td>
                    </tr>
                  ))}
                  {ecRecent.length===0 && <tr><td colSpan={5} style={{padding:20, textAlign:'center', color:C.muted}}>Loading…</td></tr>}
                </tbody>
              </table>
            </Panel>

            <Panel title="🔵 Private Res — Recent Awards" badge={privRecent.length} meta="2025–2026">
              <table>
                <thead><tr><Th>Location</Th><Th>Area</Th><Th>Bid</Th><Th>$psf ppr</Th></tr></thead>
                <tbody>
                  {privRecent.slice(0,10).map((d,i)=>(
                    <tr key={i}>
                      <LocCell name={d.location} project={d.projectName} maxWidth={160}/>
                      <Td sx={{fontSize:11}}>{d.planningArea}</Td>
                      <Td mono>{fmt(d.price)}</Td>
                      <Td mono green={gfaPsm(d)>15000}>{fmtPsf(gfaPsm(d))}</Td>
                    </tr>
                  ))}
                  {privRecent.length===0 && <tr><td colSpan={4} style={{padding:20, textAlign:'center', color:C.muted}}>Loading…</td></tr>}
                </tbody>
              </table>
            </Panel>
          </div>

          <Panel title="💡 EC vs Private — Avg $psf ppr by Planning Area (2020–2026)">
            <div style={{padding:'14px 18px'}}>
              {psmRows.map((r,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:8,
                  padding:'5px 0', borderBottom:`1px solid ${C.rule}`}}>
                  <div style={{fontSize:11, fontWeight:500, minWidth:160, flexShrink:0,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.area}</div>
                  <div style={{flex:1, display:'flex', flexDirection:'column', gap:3}}>
                    {r.ec && <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{fontSize:9, color:C.ecColor, width:14, fontWeight:700}}>EC</span>
                      <div style={{flex:1, height:4, background:C.rule, borderRadius:2}}>
                        <div style={{width:`${(r.ec/psmMax*100).toFixed(1)}%`, height:'100%',
                          background:C.ecColor, borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10, fontFamily:'DM Mono,monospace', color:C.muted,
                        width:95, textAlign:'right', flexShrink:0}}>{fmtPsf(r.ec)}</span>
                    </div>}
                    {r.pr && <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{fontSize:9, color:C.privColor, width:14, fontWeight:700}}>PR</span>
                      <div style={{flex:1, height:4, background:C.rule, borderRadius:2}}>
                        <div style={{width:`${(r.pr/psmMax*100).toFixed(1)}%`, height:'100%',
                          background:C.privColor, borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10, fontFamily:'DM Mono,monospace', color:C.muted,
                        width:95, textAlign:'right', flexShrink:0}}>{fmtPsf(r.pr)}</span>
                    </div>}
                  </div>
                </div>
              ))}
              <div style={{fontSize:10, color:C.muted, marginTop:10, fontFamily:'DM Mono,monospace'}}>
                <span style={{color:C.ecColor}}>■ EC</span> = $psf ppr &nbsp;|&nbsp;
                <span style={{color:C.privColor}}>■ PR</span> = $psf ppr · 2020–2026 sites only
              </div>
            </div>
          </Panel>
        </>}

        {/* ══ PIPELINE ══ */}
        {tab==='pipeline' && <>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22}}>
            <Stat label="Total EC Sites"     value={ecData.length}      sub="From API + fallback"   color={C.ecColor}/>
            <Stat label="Awarded 2025–26"    value={ecRecent.length}    sub="Most recent cycle"     color={C.amber}/>
            <Stat label="Avg Bid 2022–26"    value={fmt(avgOrZero(ecData.filter(d=>d.awardDate>='2022-01-01')))} sub="Recent avg" color={C.accent}/>
          </div>

          <Panel title="🟡 Awarded 2024–2026" badge={ecData.filter(d=>d.awardDate>='2024-01-01').length}>
            <table>
              <thead><tr><Th>Location</Th><Th>Planning Area</Th><Th>Award Date</Th><Th>Developer</Th><Th>Bid</Th><Th>$psf ppr</Th><Th>GFA (sqm)</Th><Th>Bids</Th></tr></thead>
              <tbody>
                {ecData.filter(d=>d.awardDate>='2024-01-01').map((d,i)=>(
                  <tr key={i} style={{background:'#fffbf0'}}>
                    <LocCell name={d.location} project={d.projectName}/>
                    <Td sx={{fontSize:11}}>{d.planningArea}</Td>
                    <Td mono>{d.awardDate}</Td>
                    <Td sx={{fontSize:10, color:C.muted}}>{d.tenderer?.slice(0,45)}</Td>
                    <Td mono>{fmt(d.price)}</Td>
                    <Td mono green={gfaPsm(d)>15000}>{fmtPsf(gfaPsm(d))}</Td>
                    <Td mono>{d.gfa ? Math.round(d.gfa).toLocaleString() : '—'}</Td>
                    <Td mono>{d.bids || '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="📋 All EC Sites" badge={ecData.length} meta="Scroll to see all" maxH="450px">
            <table>
              <thead><tr><Th>Date</Th><Th>Location</Th><Th>Planning Area</Th><Th>Developer</Th><Th>Bid</Th><Th>$psf ppr</Th><Th>Bidders</Th></tr></thead>
              <tbody>
                {ecData.map((d,i)=>(
                  <tr key={i} style={{background:d.awardDate>='2025-01-01'?'#fffbf0':'inherit'}}>
                    <Td mono>{d.awardDate}</Td>
                    <LocCell name={d.location} project={d.projectName}/>
                    <Td sx={{fontSize:11}}>{d.planningArea}</Td>
                    <Td sx={{fontSize:10, color:C.muted}}>{d.tenderer?.slice(0,40)}</Td>
                    <Td mono>{fmt(d.price)}</Td>
                    <Td mono green={gfaPsm(d)>15000}>{fmtPsf(gfaPsm(d))}</Td>
                    <Td mono>{d.bids || '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>}

        {/* ══ REGIONS ══ */}
        {tab==='regions' && <>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20}}>
            <Panel title="🟠 EC — Avg Winning Bid by Town">
              <div style={{padding:'12px 16px'}}>
                {ecAreaList.slice(0,15).map(t=>(
                  <BarRow key={t.name} label={t.name} value={t.avg} max={maxEcAvg}
                    color={C.ecColor} suffix={`${fmt(t.avg)} · ${t.count}`}/>
                ))}
              </div>
            </Panel>
            <Panel title="🔵 Private Res — Avg $psf ppr by Area">
              <div style={{padding:'12px 16px'}}>
                {privAreaList.slice(0,15).map(t=>(
                  <BarRow key={t.name} label={t.name} value={t.avgPsm} max={maxPrivPsm}
                    color={C.privColor} suffix={`${fmtPsf(t.avgPsm)} · ${t.count}`}/>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Full Region Comparison — EC vs Private">
            <table>
              <thead><tr><Th>Planning Area</Th><Th>EC Sites</Th><Th>EC Avg Bid</Th><Th>EC $psf ppr</Th><Th>Priv Sites</Th><Th>Priv Avg Bid</Th><Th>Priv $psf ppr</Th></tr></thead>
              <tbody>
                {[...new Set([...ecAreaList.map(t=>t.name),...privAreaList.map(t=>t.name)])].sort().map(name=>{
                  const ec = ecAreaList.find(t=>t.name===name)
                  const pr = privAreaList.find(t=>t.name===name)
                  return (
                    <tr key={name}>
                      <Td bold>{name}</Td>
                      <Td mono dim={!ec}>{ec?ec.count:'—'}</Td>
                      <Td mono dim={!ec}>{ec?fmt(ec.avg):'—'}</Td>
                      <Td mono dim={!ec} green={ec&&ec.avgPsm>15000}>{ec?fmtPsf(ec.avgPsm):'—'}</Td>
                      <Td mono dim={!pr}>{pr?pr.count:'—'}</Td>
                      <Td mono dim={!pr}>{pr?fmt(pr.avg):'—'}</Td>
                      <Td mono dim={!pr} green={pr&&pr.avgPsm>15000}>{pr?fmtPsf(pr.avgPsm):'—'}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Panel>
        </>}

        {/* ══ ALL BIDS ══ */}
        {tab==='allbids' && <>
          <div style={{display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center'}}>
            {[['all','All Types'],['EC','🟠 EC'],['Private','🔵 Private']].map(([v,l])=>(
              <button key={v} onClick={()=>setTypeFilter(v)} style={{
                padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:600,
                border:`1px solid ${typeFilter===v?C.ink:C.rule}`,
                background:typeFilter===v?C.ink:'#fff',
                color:typeFilter===v?'#fff':C.ink, cursor:'pointer'
              }}>{l}</button>
            ))}
            <select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)}
              style={{fontFamily:'inherit', fontSize:12, padding:'6px 10px',
                border:`1px solid ${C.rule}`, borderRadius:5, background:'#fff'}}>
              <option value=''>All Areas</option>
              {areas.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
            <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
              style={{fontFamily:'inherit', fontSize:12, padding:'6px 10px',
                border:`1px solid ${C.rule}`, borderRadius:5, background:'#fff'}}>
              <option value=''>All Years</option>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder='Search location / developer…'
              style={{fontFamily:'inherit', fontSize:12, padding:'6px 10px',
                border:`1px solid ${C.rule}`, borderRadius:5, width:210}}/>
            <button onClick={()=>{setTypeFilter('all');setAreaFilter('');setYearFilter('');setSearch('');}}
              style={{padding:'6px 12px', fontSize:11, border:`1px solid ${C.rule}`,
                borderRadius:5, background:'#fff', cursor:'pointer'}}>Clear</button>
            <span style={{fontSize:11, color:C.muted, fontFamily:'DM Mono,monospace'}}>
              {filtered.length.toLocaleString()} results
            </span>
          </div>

          <Panel title="All Residential Land Bids" maxH="600px">
            <table>
              <thead><tr><Th>Type</Th><Th>Date</Th><Th>Location</Th><Th>Area</Th><Th>Developer</Th><Th>Price</Th><Th>$psf ppr</Th><Th>Bids</Th></tr></thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={8} style={{padding:30, textAlign:'center', color:C.muted}}>No results</td></tr>
                )}
                {filtered.slice(0,300).map((d,i)=>(
                  <tr key={i} style={{background:d.date>='2025-01-01'?'#fffbf0':'inherit'}}>
                    <Td><Badge type={d.type}>{d.type}</Badge></Td>
                    <Td mono>{d.date}</Td>
                    <LocCell name={d.name} project={d.project} maxWidth={180}/>
                    <Td sx={{fontSize:11}}>{d.area}</Td>
                    <Td sx={{fontSize:10, color:C.muted}}>{d.developer?.slice(0,45)}{d.developer?.length>45?'…':''}</Td>
                    <Td mono red={d.price>1e9}>{fmt(d.price)}</Td>
                    <Td mono dim={!d.psm} green={d.psm>15000}>{fmtPsf(d.psm)}</Td>
                    <Td mono>{d.bids||'—'}</Td>
                  </tr>
                ))}
                {filtered.length>300 && (
                  <tr><td colSpan={8} style={{padding:12, textAlign:'center',
                    color:C.muted, fontSize:11}}>
                    Showing 300 of {filtered.length.toLocaleString()} — use filters to narrow down
                  </td></tr>
                )}
              </tbody>
            </table>
          </Panel>
        </>}

        <footer style={{marginTop:32, paddingTop:16, borderTop:`1px solid ${C.rule}`,
          fontSize:11, color:C.muted, fontFamily:'DM Mono,monospace', textAlign:'center'}}>
          Data source: <a href="https://data.gov.sg/datasets/d_0e2b42f98535686282031a42c9c7b05a/view"
            target="_blank" rel="noreferrer" style={{color:C.blue}}>URA Sale Sites · data.gov.sg</a>
          &nbsp;·&nbsp; Built with Next.js · Hosted on Vercel
        </footer>
      </main>
    </div>
  )
}
