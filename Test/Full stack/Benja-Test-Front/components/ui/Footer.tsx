import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type FooterLink = {
  id: string;
  title: string;
  onPress: () => void;
};

type FooterProps = {
  links: FooterLink[];
  companyName?: string;
};

export function Footer({ links, companyName = 'SafeBities' }: FooterProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.linksContainer}>
        {links.map((link) => (
          <Pressable key={link.id} onPress={link.onPress} style={styles.linkButton}>
            <ThemedText style={styles.linkText} type="link">
              {link.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <ThemedText style={styles.copyright} lightColor="#999999" darkColor="#999999">
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDDDDD',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
  },
});