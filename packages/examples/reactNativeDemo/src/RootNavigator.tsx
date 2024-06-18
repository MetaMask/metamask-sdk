import React from 'react';
import {RootStack} from './screens/navigation.params';
import {MainTabNavigator} from './MainTabNavigator';

export default function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="main"
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
}
