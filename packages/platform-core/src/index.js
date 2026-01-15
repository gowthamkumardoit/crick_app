"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeLedgerEntry = exports.createLedgerEntry = exports.buildWalletFromLedger = exports.debitWallet = exports.creditWallet = exports.ZERO_MONEY = exports.subtractMoney = exports.addMoney = exports.isLessThan = exports.negateMoney = exports.money = exports.isErr = exports.ErrorCode = exports.ErrorCategory = void 0;
// ---------- RUNTIME VALUES ----------
var types_1 = require("./errors/types");
Object.defineProperty(exports, "ErrorCategory", { enumerable: true, get: function () { return types_1.ErrorCategory; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return types_1.ErrorCode; } });
// ---------- DOMAIN HELPERS (RUNTIME – ALLOWED) ----------
var result_1 = require("./errors/result");
Object.defineProperty(exports, "isErr", { enumerable: true, get: function () { return result_1.isErr; } });
var money_1 = require("./wallet/money");
Object.defineProperty(exports, "money", { enumerable: true, get: function () { return money_1.money; } });
Object.defineProperty(exports, "negateMoney", { enumerable: true, get: function () { return money_1.negateMoney; } });
Object.defineProperty(exports, "isLessThan", { enumerable: true, get: function () { return money_1.isLessThan; } });
Object.defineProperty(exports, "addMoney", { enumerable: true, get: function () { return money_1.addMoney; } });
Object.defineProperty(exports, "subtractMoney", { enumerable: true, get: function () { return money_1.subtractMoney; } });
Object.defineProperty(exports, "ZERO_MONEY", { enumerable: true, get: function () { return money_1.ZERO_MONEY; } });
var wallet_service_1 = require("./wallet/wallet.service");
Object.defineProperty(exports, "creditWallet", { enumerable: true, get: function () { return wallet_service_1.creditWallet; } });
Object.defineProperty(exports, "debitWallet", { enumerable: true, get: function () { return wallet_service_1.debitWallet; } });
Object.defineProperty(exports, "buildWalletFromLedger", { enumerable: true, get: function () { return wallet_service_1.buildWalletFromLedger; } });
var ledger_service_1 = require("./ledger/ledger.service");
Object.defineProperty(exports, "createLedgerEntry", { enumerable: true, get: function () { return ledger_service_1.createLedgerEntry; } });
var ledger_decoder_1 = require("./ledger/ledger.decoder");
Object.defineProperty(exports, "decodeLedgerEntry", { enumerable: true, get: function () { return ledger_decoder_1.decodeLedgerEntry; } });
