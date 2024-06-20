import React from 'react';

import {RootStack} from './screens/navigation.params';
import {MainTabNavigator} from './MainTabNavigator';

export default function RootNavigator() {
  return (
    <RootStack.Navigator>
      {/* Add potential other naviation flow such as onboarding / login */}
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
