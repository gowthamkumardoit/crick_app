import type { NavigatorScreenParams } from "@react-navigation/native";

/* ---------- AUTH STACK ---------- */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Tabs: undefined;
};


/* ---------- WALLET STACK ---------- */
export type WalletStackParamList = {
    WalletHome: undefined;
    WalletPayments: undefined;

    AddCashAmount: undefined;
    AddCashMethods: { amount: number };
    AddCashUpload: { amount: number };
    AddCashSuccess: undefined;
    WithdrawAmount: undefined;
    WithdrawSuccess: undefined;
};

/* ---------- TAB NAVIGATOR ---------- */
export type TabParamList = {
    Home: undefined;
    Matches: undefined;
    Wallet: NavigatorScreenParams<WalletStackParamList>;
    Profile: undefined;
};

/* ---------- ROOT STACK ---------- */
export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    Settings: undefined;
    EditProfile: undefined;
    KycVerification: undefined;
    KycSuccess: undefined;
    Notifications: undefined;
    ChangePassword: undefined;
    Privacy: undefined;
    HelpSupport: undefined;
    TermsConditions: undefined;
    About: undefined;
    ContestList: undefined;
    Auth: undefined;
    AuthStack: undefined;
    ContestDetails: undefined;
    BankUpiDetails: undefined;

};
