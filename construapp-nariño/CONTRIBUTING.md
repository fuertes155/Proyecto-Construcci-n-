# 🤝 Guía de Contribución - ConstruApp Nariño

¡Gracias por interesarte en contribuir a ConstruApp Nariño! Este documento te guiará en el proceso.

## Código de Conducta

Este proyecto adhiere a los Principios de Código Abierto. Al participar, se espera que mantengas un ambiente respetuoso y profesional.

## ¿Cómo Puedo Contribuir?

### Reportar Bugs

Si encuentras un bug, crea un issue en GitHub con:

1. **Título claro**: Descripción breve del problema
2. **Descripción detallada**: Qué pasó, qué esperabas que pasara
3. **Pasos para reproducir**: Paso a paso cómo replicar el error
4. **Screenshots/Logs**: Pruebas visuales del problema
5. **Ambiente**: SO, versión de Node, navegador, etc.

### Sugerir Mejoras

¿Tienes una idea? Abre un issue con la etiqueta `enhancement`:

1. **Descripción clara**: Qué mejora sugieres
2. **Justificación**: Por qué es importante
3. **Ejemplo de implementación**: Cómo se vería

### Contribuir Código

#### Configuración Inicial

1. **Fork el repositorio**
```bash
# En GitHub, haz click en "Fork"
```

2. **Clona tu fork**
```bash
git clone https://github.com/tu_usuario/construapp-nariño.git
cd construapp-nariño
```

3. **Crea una rama para tu feature**
```bash
git checkout -b feature/nombre-descriptivo
# o para fixes:
git checkout -b fix/nombre-descriptivo
```

4. **Instala dependencias**
```bash
npm install
```

#### Desarrollo

1. **Sigue nuestros estándares de código:**
   - Usa TypeScript
   - Estilos con Prettier y ESLint
   - Componentes pequeños y reutilizables
   - Naming descriptivo (camelCase para variables, PascalCase para componentes)

2. **Ejecuta linting antes de commitear**
```bash
npm run lint
npm run format
```

3. **Escribe tests para tu código**
```bash
npm test
```

4. **Verifica que todo compila**
```bash
npm run build
```

#### Commit Messages

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): descripción breve

Descripción más detallada si es necesario.

Footer: Referencia a issues, breaking changes, etc.
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionamiento)
- `refactor`: Reorganización de código
- `perf`: Mejora de performance
- `test`: Agregar o actualizar tests
- `chore`: Cambios de configuración, dependencias, etc.

**Ejemplos:**

```bash
git commit -m "feat(calculator): agregar cálculo de acero de refuerzo"
git commit -m "fix(auth): corregir validación de email"
git commit -m "docs: actualizar guía de instalación"
git commit -m "refactor(api): reorganizar estructura de rutas"
```

#### Push a tu Fork

```bash
git push origin feature/nombre-descriptivo
```

#### Crear Pull Request

1. Ve a GitHub y abre un PR desde tu rama
2. Completa el template de PR:
   - Descripción clara de cambios
   - Screenshots si es UI
   - Testing que realizaste
   - Referencia a issues relacionados

3. Asegúrate de que:
   - Los tests pasen (CI/CD checks)
   - No hay conflictos con main
   - El código sigue los estándares

## Estándares de Código

### TypeScript

```typescript
// ✅ BIEN
interface User {
  id: string;
  email: string;
  name: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ MAL
const getUser = async (id) => {
  // ...
};
```

### React Components

```typescript
// ✅ BIEN - Componente pequeño y testeable
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

// ❌ MAL - Demasiado código en un componente
const PageWithEverything = () => {
  // 500+ líneas
};
```

### Styling

```typescript
// ✅ BIEN - Usar Tailwind classes
<div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
  {/* contenido */}
</div>

// ❌ MAL - Estilos inline o CSS improvisado
<div style={{ display: 'flex', backgroundColor: 'white' }}>
  {/* contenido */}
</div>
```

## Estructura de Carpetas

Mantén la estructura consistente:

```
backend/src/
  ├── routes/           # Definición de rutas
  ├── controllers/      # Lógica de endpoints
  ├── services/         # Lógica de negocio
  ├── models/           # Modelos de datos
  ├── middleware/       # Middleware
  └── utils/            # Funciones auxiliares

frontend/src/
  ├── components/       # Componentes reutilizables
  ├── pages/            # Páginas completas
  ├── services/         # Llamadas a API
  ├── hooks/            # Custom hooks
  ├── context/          # Context API
  ├── types/            # TypeScript types
  └── utils/            # Funciones auxiliares
```

## Testing

### Backend - Jest

```typescript
describe('Calculator Service', () => {
  it('should calculate concrete volume correctly', () => {
    const result = calculateConcreteVolume(2, 3, 0.5);
    expect(result).toBe(3); // 2 * 3 * 0.5
  });
});
```

### Frontend - Vitest + React Testing Library

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Documentación

- Documenta funciones complejas
- Usa JSDoc para funciones públicas
- Comenta el "por qué", no el "qué"
- Actualiza README si agradegas features

```typescript
/**
 * Calcula el volumen de hormigón necesario
 * @param length - Largo en metros
 * @param width - Ancho en metros
 * @param height - Alto en metros
 * @returns Volumen en metros cúbicos
 */
export const calculateConcreteVolume = (
  length: number,
  width: number,
  height: number
): number => {
  return length * width * height;
};
```

## Performance

- Evita renders innecesarios (useMemo, useCallback)
- Lazy load componentes grandes
- Optimiza imágenes
- Minimiza bundle size

## Seguridad

- Nunca commitees secrets o contraseñas
- Valida inputs en frontend y backend
- Usa variables de entorno para configuración sensible
- Reporta vulnerabilidades a security@construappnariño.com

## Proceso de Review

1. Otra persona revisará tu código
2. Debe pasar los tests automáticos
3. Se pueden solicitar cambios
4. Una vez aprobado, se hace merge a `main`

## Preguntas Frecuentes

**¿Puedo trabajar en múltiples features a la vez?**
- Usa ramas separadas para cada feature

**¿Qué si mi PR no es aceptado?**
- Es normal, se dan razones de por qué
- Puedes iterar o discutir cambios

**¿Cómo contacto al equipo?**
- Email: dev@construappnariño.com
- Discord: [Servidor de Comunidad](https://discord.gg/construapp)

## Gracias

¡Agradecemos mucho tu contribución! Tu trabajo ayuda a mejorar esta herramienta para constructores de Nariño.

---

**Happy Coding! 🚀**
