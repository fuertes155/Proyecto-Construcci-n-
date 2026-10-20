import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const tools = [
  {
    icon: 'calculator-variant-outline' as const,
    title: 'Calcula materiales',
    description: 'Cantidades estimadas para cada etapa de tu obra.',
  },
  {
    icon: 'storefront-outline' as const,
    title: 'Compara precios',
    description: 'Referencias de proveedores locales de Nariño.',
  },
  {
    icon: 'folder-multiple-outline' as const,
    title: 'Organiza proyectos',
    description: 'Presupuestos y listas de compra en un solo lugar.',
  },
];

export default function HomeScreen() {
  const scrollView = useRef<ScrollView>(null);
  const toolsOffset = useRef(0);

  const showTools = () => {
    scrollView.current?.scrollTo({ y: toolsOffset.current, animated: true });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        ref={scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons name="hammer-wrench" size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.brandName}>ConstruApp</Text>
              <Text style={styles.brandRegion}>NARIÑO</Text>
            </View>
          </View>
          <View style={styles.location}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={15}
              color={colors.brand}
            />
            <Text style={styles.locationText}>Colombia</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroPattern} />
          <View style={styles.heroContent}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>HECHA PARA CONSTRUIR MEJOR</Text>
            </View>
            <Text style={styles.heroTitle}>
              Tu obra empieza con un buen <Text style={styles.heroAccent}>cálculo.</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Planea tus materiales y presupuesto con herramientas pensadas para Nariño.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={showTools}
              style={({ pressed }) => [styles.heroButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.heroButtonText}>Conoce las herramientas</Text>
              <MaterialCommunityIcons name="arrow-down" size={18} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.preview}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIcon}>
                <MaterialCommunityIcons
                  name="cube-outline"
                  size={19}
                  color={colors.brandLight}
                />
              </View>
              <View style={styles.previewHeading}>
                <Text style={styles.previewLabel}>VISTA PREVIA</Text>
                <Text style={styles.previewTitle}>Volumen de una losa</Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={18}
                color={colors.mutedOnDark}
              />
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.measurements}>
              <View>
                <Text style={styles.measureLabel}>LARGO</Text>
                <Text style={styles.measureValue}>4,2 m</Text>
              </View>
              <MaterialCommunityIcons
                name="close"
                size={15}
                color={colors.mutedOnDark}
                style={styles.measureOperator}
              />
              <View>
                <Text style={styles.measureLabel}>ANCHO</Text>
                <Text style={styles.measureValue}>3,5 m</Text>
              </View>
              <MaterialCommunityIcons
                name="close"
                size={15}
                color={colors.mutedOnDark}
                style={styles.measureOperator}
              />
              <View>
                <Text style={styles.measureLabel}>ESPESOR</Text>
                <Text style={styles.measureValue}>10 cm</Text>
              </View>
            </View>
            <View style={styles.previewResult}>
              <Text style={styles.resultLabel}>VOLUMEN DE REFERENCIA</Text>
              <Text style={styles.resultValue}>
                1,47 <Text style={styles.resultUnit}>m³</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.exampleNote}>Ejemplo ilustrativo · valida las medidas de tu obra</Text>
        </View>

        <View
          onLayout={(event) => {
            toolsOffset.current = event.nativeEvent.layout.y;
          }}
          style={styles.toolsSection}
        >
          <Text style={styles.sectionEyebrow}>PRÓXIMAMENTE EN MÓVIL</Text>
          <Text style={styles.sectionTitle}>Todo para avanzar en tu obra.</Text>
          <Text style={styles.sectionDescription}>
            Estamos preparando estas herramientas para que planear sea más sencillo.
          </Text>

          <View style={styles.toolList}>
            {tools.map((tool) => (
              <View key={tool.title} style={styles.toolCard}>
                <View style={styles.toolIcon}>
                  <MaterialCommunityIcons
                    name={tool.icon}
                    size={22}
                    color={colors.brand}
                  />
                </View>
                <View style={styles.toolCopy}>
                  <View style={styles.toolTitleRow}>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <View style={styles.comingSoon}>
                      <Text style={styles.comingSoonText}>PRONTO</Text>
                    </View>
                  </View>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <MaterialCommunityIcons name="hard-hat" size={18} color={colors.brand} />
          <Text style={styles.footerText}>Construyendo mejores decisiones, contigo.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  canvas: '#F5F2EC',
  white: '#FFFFFF',
  ink: '#1C1915',
  muted: '#575047',
  subtle: '#746B60',
  line: '#E4DED3',
  brand: '#B33A09',
  brandLight: '#F27635',
  brandSoft: '#FDEBDD',
  dark: '#211F1A',
  darkRaised: '#2D2A24',
  mutedOnDark: '#B8B0A5',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.brand,
  },
  brandName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandRegion: {
    marginTop: 1,
    color: colors.subtle,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  locationText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  hero: {
    overflow: 'hidden',
    marginTop: 12,
    padding: 22,
    borderRadius: 24,
    backgroundColor: colors.dark,
  },
  heroPattern: {
    position: 'absolute',
    top: -74,
    right: -74,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: '#494238',
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 17,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brandLight,
  },
  eyebrowText: {
    color: '#D9D0C3',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  heroTitle: {
    maxWidth: 320,
    color: colors.white,
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -1.3,
    lineHeight: 39,
  },
  heroAccent: {
    color: '#F28A4F',
  },
  heroDescription: {
    maxWidth: 300,
    marginTop: 12,
    color: '#D0C8BD',
    fontSize: 14,
    lineHeight: 21,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 46,
    marginTop: 19,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: '#F4A261',
  },
  buttonPressed: {
    opacity: 0.78,
  },
  heroButtonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  preview: {
    marginTop: 24,
    padding: 15,
    borderRadius: 17,
    backgroundColor: colors.darkRaised,
    borderWidth: 1,
    borderColor: '#454038',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#44362C',
  },
  previewHeading: {
    flex: 1,
  },
  previewLabel: {
    color: colors.brandLight,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  previewTitle: {
    marginTop: 2,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  previewDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: '#49443C',
  },
  measurements: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureLabel: {
    color: colors.mutedOnDark,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  measureValue: {
    marginTop: 4,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  measureOperator: {
    marginTop: 11,
  },
  previewResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#49443C',
  },
  resultLabel: {
    color: colors.mutedOnDark,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  resultValue: {
    color: '#F4A261',
    fontSize: 22,
    fontWeight: '800',
  },
  resultUnit: {
    fontSize: 12,
  },
  exampleNote: {
    marginTop: 10,
    color: '#B8B0A5',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
  toolsSection: {
    paddingTop: 32,
  },
  sectionEyebrow: {
    color: colors.brand,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    marginTop: 7,
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 30,
  },
  sectionDescription: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  toolList: {
    gap: 10,
    marginTop: 18,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  toolIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.brandSoft,
  },
  toolCopy: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  toolTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  comingSoon: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.brandSoft,
  },
  comingSoonText: {
    color: colors.brand,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toolDescription: {
    marginTop: 4,
    color: colors.subtle,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerText: {
    color: colors.subtle,
    fontSize: 10,
    fontWeight: '600',
  },
});
