import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginIdoso } from '../api/authApi';
import { BrandLogo } from '../components/BrandLogo';
import { colors } from '../constants/colors';

export default function AcessoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const codigoValido = codigo.trim().length >= 6;

  async function handleEntrar() {
    if (!codigoValido || carregando) return;

    try {
      setCarregando(true);
      setErro('');
      await loginIdoso(codigo.trim());
      navigation.replace('Home');
    } catch (error) {
      setErro(error.message || 'Nao foi possivel acessar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBloco}>
            <BrandLogo
              size="lg"
              centered
              subtitle="Acompanhamento de medicacoes e cuidados"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Acesso do paciente</Text>
            <Text style={styles.cardDesc}>Digite seu codigo de acesso para continuar</Text>

            <View style={styles.campoBloco}>
              <Text style={styles.campoLabel}>Codigo de acesso</Text>
              <TextInput
                style={styles.inputCodigo}
                value={codigo}
                onChangeText={(v) => {
                  const codigoLimpo = v.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 11).toUpperCase();
                  setCodigo(codigoLimpo);
                  if (erro) setErro('');
                }}
                maxLength={11}
                placeholder="Digite o codigo fornecido"
                placeholderTextColor="#9a9a9a"
                returnKeyType="done"
                onSubmitEditing={handleEntrar}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!carregando}
              />
            </View>

            {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}

            <TouchableOpacity
              style={[styles.btnEntrar, codigoValido && styles.btnEntrarOk]}
              onPress={handleEntrar}
              disabled={!codigoValido || carregando}
              activeOpacity={0.85}
            >
              <Text style={styles.btnEntrarTexto}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cinzaBg,
  },
  keyboardArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.cinzaBg,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 96,
  },
  logoBloco: {
    alignItems: 'center',
    marginBottom: 34,
  },
  card: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    padding: 28,
    gap: 20,
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: '700',
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
  campoBloco: {
    gap: 8,
  },
  campoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.texto,
  },
  inputCodigo: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: colors.texto,
    backgroundColor: colors.inputBg,
    outlineStyle: 'none',
  },
  erroTexto: {
    color: colors.vermelho,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -8,
  },
  btnEntrar: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: colors.verde,
    borderRadius: 14,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.branco,
  },
});
