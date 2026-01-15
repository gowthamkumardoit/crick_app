import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from '../screens/WalletScreen';
// import WalletPaymentsScreen from "../screens/wallet/WalletPaymentsScreen";
import AddCashAmountScreen from '../screens/wallet/AddCashAmountScreen';
import AddCashMethodsScreen from '../screens/wallet/AddCashMethodsScreen';
import AddCashUploadScreen from '../screens/wallet/AddCashUploadScreen';
import { WalletStackParamList } from './types';
import AddCashSuccessScreen from 'screens/wallet/AddCashSuccessScreen';
import WithdrawAmountScreen from 'screens/wallet/WithdrawAmountScreen';
import WithdrawSuccessScreen from 'screens/wallet/WithdrawalSuccessScreen';
// import WithdrawAmountScreen from "@/screens/wallet/WithdrawAmountScreen";
// import ManageBankAccountsScreen from "@/screens/wallet/ManageBankAccountsScreen";
// import ManageUpiScreen from "@/screens/wallet/ManageUpiScreen";

const Stack = createNativeStackNavigator<WalletStackParamList>();

export default function WalletStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletHome" component={WalletScreen} />
      {/* <Stack.Screen name="WalletPayments" component={WalletPaymentsScreen} /> */}

      <Stack.Screen name="AddCashAmount" component={AddCashAmountScreen} />
      <Stack.Screen name="AddCashMethods" component={AddCashMethodsScreen} />
      <Stack.Screen name="AddCashUpload" component={AddCashUploadScreen} />
      <Stack.Screen name="AddCashSuccess" component={AddCashSuccessScreen} />
      <Stack.Screen name="WithdrawAmount" component={WithdrawAmountScreen} />
      <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} />

      {/* <Stack.Screen name="WithdrawAmount" component={WithdrawAmountScreen} /> */}
    </Stack.Navigator>
  );
}
