module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // El plugin de reanimated debe ir siempre al final de la lista.
    plugins: ['react-native-reanimated/plugin'],
  };
};
