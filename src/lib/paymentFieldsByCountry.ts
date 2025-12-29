// Country-specific payment field config for branch forms
export const paymentFieldsByCountry: Record<string, {
  branchNamePlaceholder: string;
  whatsappPlaceholder: string;
  bankPlaceholder: string;
  accountNumberPlaceholder: string;
  ibanPlaceholder: string;
  accountTitlePlaceholder: string;
  otherMethodsLabel: string;
  otherMethodsPlaceholder: string;
}> = {
  Pakistan: {
    branchNamePlaceholder: 'Main Branch, DHA, etc.',
    whatsappPlaceholder: '03xxxxxxxxx',
    bankPlaceholder: 'Meezan Bank, HBL, etc.',
    accountNumberPlaceholder: 'e.g. 0355XXXXXXXXXX',
    ibanPlaceholder: 'PKxxMEZN0xxxxxxxxxxxxxx',
    accountTitlePlaceholder: 'Galaxy Sports',
    otherMethodsLabel: 'Other Payment Methods (JazzCash / Easypaisa / etc.)',
    otherMethodsPlaceholder: 'JazzCash: 03xx xxxxxxx (Name)\nEasypaisa: 03xx xxxxxxx (Name)',
  },
  Indonesia: {
    branchNamePlaceholder: 'Main Branch, Jakarta, etc.',
    whatsappPlaceholder: '08xxxxxxxxxx',
    bankPlaceholder: 'BCA, Mandiri, BRI, etc.',
    accountNumberPlaceholder: 'e.g. 1234567890',
    ibanPlaceholder: 'IDxxBANKxxxxxxxxxxxxxx',
    accountTitlePlaceholder: 'Arena Indonesia',
    otherMethodsLabel: 'Other Payment Methods (GoPay / OVO / etc.)',
    otherMethodsPlaceholder: 'GoPay: 08xx xxxxxxxx (Name)\nOVO: 08xx xxxxxxxx (Name)',
  },
  Malaysia: {
    branchNamePlaceholder: 'Main Branch, Kuala Lumpur, etc.',
    whatsappPlaceholder: '01xxxxxxxx',
    bankPlaceholder: 'Maybank, CIMB, etc.',
    accountNumberPlaceholder: 'e.g. 1234567890',
    ibanPlaceholder: 'MYxxBANKxxxxxxxxxxxxxx',
    accountTitlePlaceholder: 'Arena Malaysia',
    otherMethodsLabel: "Other Payment Methods (Touch 'n Go / Boost / etc.)",
    otherMethodsPlaceholder: "Touch 'n Go: 01x xxxxxxxx (Name)\nBoost: 01x xxxxxxxx (Name)",
  },
  Other: {
    branchNamePlaceholder: 'Branch Name',
    whatsappPlaceholder: 'WhatsApp Number',
    bankPlaceholder: 'Your Bank Name',
    accountNumberPlaceholder: 'Account Number',
    ibanPlaceholder: 'IBAN / Account Ref',
    accountTitlePlaceholder: 'Account Title',
    otherMethodsLabel: 'Other Payment Methods',
    otherMethodsPlaceholder: 'Mobile Wallet: Number (Name)',
  },
};
