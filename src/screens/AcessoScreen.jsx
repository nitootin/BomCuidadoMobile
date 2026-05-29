import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../src/constants/colors';

export default function AcessoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');

  const codigoValido = codigo.length === 8;

  function handleEntrar() {
    if (codigoValido) {
      navigation.navigate('Home');
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logoBloco}>
        <View style={styles.logoIcone}>
          <Text style={styles.logoEmoji}>❤️</Text>
        </View>
        <Text style={styles.logoNome}>BomCuidado</Text>
        <Text style={styles.logoSub}>Cuidando de você com carinho</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Acesso do Paciente</Text>
        <Text style={styles.cardDesc}>Digite seu código de acesso para continuar</Text>

        <View style={styles.campoBloco}>
          <Text style={styles.campoLabel}>Código de Acesso</Text>
          <TextInput
            style={styles.inputCodigo}
            value={codigo}
            onChangeText={(v) => {
              const numeros = v.replace(/[^0-9]/g, '').slice(0, 8);
              setCodigo(numeros);
            }}
            maxLength={8}
            placeholder="Digite o código fornecido"
            placeholderTextColor="#BDBDBD"
            returnKeyType="done"
            onSubmitEditing={handleEntrar}
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.btnEntrar, codigoValido && styles.btnEntrarOk]}
          onPress={handleEntrar}
          disabled={!codigoValido}
          activeOpacity={0.85}
        >
          <Text style={styles.btnEntrarTexto}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.ajudaBtn}>Precisa de ajuda?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F2F4F3',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Logo
  logoBloco: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoIcone: {
    width: 80,
    height: 80,
    backgroundColor: colors.verde,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 38,
  },
  logoNome: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.texto,
  },
  logoSub: {
    fontSize: 14,
    color: colors.textoMudo,
    fontWeight: '400',
  },

  // Card
  card: {
    backgroundColor: colors.branco,
    borderRadius: 24,
    padding: 28,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.texto,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textoMudo,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -12,
  },

  // Campo
  campoBloco: {
    gap: 8,
  },
  campoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.texto,
  },
  inputCodigo: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    color: colors.texto,
    backgroundColor: '#FAFAFA',
    outlineStyle: 'none',
  },

  // Botão
  btnEntrar: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: colors.verde,
    borderRadius: 16,
    alignItems: 'center',
    opacity: 0.4,
  },
  btnEntrarOk: {
    opacity: 1,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnEntrarTexto: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  // Ajuda
  ajudaBtn: {
    fontSize: 14,
    color: colors.textoMudo,
    fontWeight: '600',
    textAlign: 'center',
  },
});