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
        <Text style={styles.cardTitulo}>Digite seu código de acesso</Text>
        <Text style={styles.cardDesc}>O código foi fornecido pelo seu cuidador</Text>

        <Text style={styles.campoLabel}>Código de 8 dígitos</Text>

        <TextInput
          style={styles.inputCodigo}
          value={codigo}
          onChangeText={(v) => {
            const numeros = v.replace(/[^0-9]/g, '').slice(0, 8);
            setCodigo(numeros);
          }}
          maxLength={8}
          placeholder="12345678"
          placeholderTextColor={colors.cinzaBorda}
          returnKeyType="done"
          onSubmitEditing={handleEntrar}
          autoCorrect={false}
        />

        <Text style={styles.codigoDica}>Código fornecido pelo seu cuidador</Text>

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
    backgroundColor: colors.verde,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  // Logo
  logoBloco: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
  },
  logoIcone: {
    width: 88,
    height: 88,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoNome: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },

  // Card
  card: {
    backgroundColor: colors.branco,
    borderRadius: 28,
    padding: 28,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
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
    marginTop: -8,
  },

  // Input
  campoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textoMudo,
  },
  inputCodigo: {
    height: 62,
    borderWidth: 2,
    borderColor: colors.cinzaBorda,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 8,
    color: colors.verdeEsc,
    backgroundColor: colors.cinzaBg,
    outlineStyle: 'none',
  },
  codigoDica: {
    fontSize: 12,
    color: colors.textoMudo,
    textAlign: 'center',
    marginTop: -8,
  },

  // Botão
  btnEntrar: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: colors.verde,
    borderRadius: 18,
    alignItems: 'center',
    opacity: 0.35,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnEntrarOk: {
    opacity: 1,
  },
  btnEntrarTexto: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },

  // Ajuda
  ajudaBtn: {
    fontSize: 14,
    color: colors.textoMudo,
    fontWeight: '500',
    textAlign: 'center',
  },
});