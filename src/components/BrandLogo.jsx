import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

const sizes = {
  sm: { icon: 32, text: 20, mark: 15 },
  md: { icon: 42, text: 26, mark: 18 },
  lg: { icon: 56, text: 32, mark: 24 },
};

export function BrandLogo({ size = 'md', centered = false, subtitle }) {
  const current = sizes[size] || sizes.md;

  return (
    <View style={[styles.wrapper, centered && styles.centered]}>
      <View style={styles.row}>
        <View
          style={[
            styles.icon,
            {
              width: current.icon,
              height: current.icon,
              borderRadius: Math.round(current.icon * 0.3),
            },
          ]}
        >
          <Text style={[styles.iconText, { fontSize: current.mark }]}>BC</Text>
        </View>
        <Text style={[styles.name, { fontSize: current.text }]}>BomCuidado</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  centered: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.verde,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  iconText: {
    color: colors.branco,
    fontWeight: '900',
    letterSpacing: 0,
  },
  name: {
    color: colors.verde,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textoMudo,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
