import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from "@expo-google-fonts/playfair-display";
import * as SplashScreenExpo from "expo-splash-screen";
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SearchScreen from "./src/screens/SearchScreen";
import DisambiguationScreen from "./src/screens/DisambiguationScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import HistoricoScreen from "./src/screens/HistoricoScreen";
import ConversorScreen from "./src/screens/ConversorScreen";

const Stack = createNativeStackNavigator();
SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold });

  if (!fontsLoaded) return null;
  SplashScreenExpo.hideAsync();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Busca" component={SearchScreen} />
        <Stack.Screen name="Desambiguacao" component={DisambiguationScreen} />
        <Stack.Screen name="Resultados" component={ResultsScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
        <Stack.Screen name="Conversor" component={ConversorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
