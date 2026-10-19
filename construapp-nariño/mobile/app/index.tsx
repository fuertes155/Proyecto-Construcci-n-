import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const apiUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:5000/api';

const calculators = [
  { id: 'concrete', label: 'Hormigón' },
  { id: 'brick', label: 'Mampostería' },
  { id: 'mortar', label: 'Mortero' },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>ConstruApp Nariño</Text>
      <Text style={styles.title}>Calcula materiales de construcción</Text>
      <Text style={styles.subtitle}>
        Base móvil del proyecto (Fase 1.5). Las calculadoras y la sincronización
        offline se implementan en los siguientes pasos.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculadoras previstas</Text>
        {calculators.map((calc) => (
          <Text key={calc.id} style={styles.cardItem}>
            • {calc.label}
          </Text>
        ))}
      </View>

      <Text style={styles.meta}>API: {apiUrl}</Text>
      <Link href="/" style={styles.link}>
        Recargar inicio
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  kicker: {
    color: '#b33a09',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1c1915',
  },
  subtitle: {
    fontSize: 15,
    color: '#575047',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e4ded3',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1915',
    marginBottom: 4,
  },
  cardItem: {
    fontSize: 14,
    color: '#575047',
  },
  meta: {
    marginTop: 12,
    fontSize: 12,
    color: '#746b60',
  },
  link: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#b33a09',
  },
});
