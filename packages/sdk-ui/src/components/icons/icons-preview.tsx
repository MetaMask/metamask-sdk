import React from 'react';
import { IconOriginal } from './IconOriginal';
import { IconSimplified } from './IconsSimplified';
import { IconWrongNetwork } from './IconWrongNetwork';
import { Image, StyleSheet, View } from 'react-native';
import images from 'images/image-icons';
import { Text } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  simplifiedContainer: {
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: 'lightgrey',
  },
  allCryptoIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  iconContainer: { padding: 10, margin: 5, alignItems: 'center' },
  cryptoIcon: { width: 50, height: 50 },
});
export interface IconsPreviewProps {}
export const IconsPreview = (_props: IconsPreviewProps) => {
  return (
    <View style={styles.container}>
      <IconOriginal />
      <View style={styles.simplifiedContainer}>
        <Text>IconSimplified</Text>
        <IconSimplified color="orange" />
        <IconSimplified color="white" />
      </View>
      <IconWrongNetwork />
      <View style={styles.allCryptoIcons}>
        {Object.keys(images).map((imageKey, index) => (
          <View key={`img${index}`} style={styles.iconContainer}>
            <Text>{imageKey}</Text>
            <Image style={styles.cryptoIcon} source={images[imageKey]} />
          </View>
        ))}
      </View>
    </View>
  );
};
