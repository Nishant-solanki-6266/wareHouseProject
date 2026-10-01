export const initialSettings = {
  companyProfile: {
    companyName: "VI Customs Brokers & Logistics",
    legalName: "VI Customs Brokers & Logistics",
    taxId: "EIN-59-9948210",
    fmcNumber: "FMC-OTI #028914N",
    addressLine1: "8400 NW 36th Street, Suite 500",
    city: "Miami",
    state: "Florida",
    zipCode: "33166",
    country: "United States",
    phone: "+1 (305) 555-KERS (5377)",
    email: "operations@vicustoms.com",
    website: "https://www.kerslogistics.com"
  },
  numberingRules: {
    warehouseReceiptPrefix: "WR-2026-",
    billOfLadingPrefix: "BL-VI-2026-",
    shipmentPrefix: "SHP-2026-",
    consolidationPrefix: "CNS-2026-",
    manifestPrefix: "MNF-2026-",
    nextSequenceNumber: 1047
  },
  labelSettings: {
    rollSize: "4x6", // 4 inches x 6 inches standard roll
    barcodeType: "Code 128",
    includeQrCode: true,
    includeHandlingIcons: true,
    autoPrintOnReceiptCreation: false,
    fontSizeStandard: "12pt"
  },
  unitsAndCurrencies: {
    defaultWeightUnit: "LBS",
    defaultDimensionUnit: "INCHES",
    defaultVolumeUnit: "CBM & CFT",
    defaultCurrency: "USD ($)",
    timezone: "America/New_York (EST / UTC-5)"
  }
};
