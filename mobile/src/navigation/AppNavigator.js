import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OTPScreen } from '../screens/OTPScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SendOTPScreen } from '../screens/SendOTPScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
                <Stack.Screen name="SendOTP" component={SendOTPScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Camera" component={CameraScreen} />
                <Stack.Screen name="Results" component={ResultsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
