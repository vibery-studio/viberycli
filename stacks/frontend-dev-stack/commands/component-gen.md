# component-gen

Generate React components following project patterns.

## Usage

```
/component-gen <component-name> [--type feature|component] [--with-api] [--with-form]
```

## Options

| Option             | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `--type feature`   | Create full feature with api/, components/, hooks/, types/ |
| `--type component` | Create single reusable component                           |
| `--with-api`       | Include API service layer                                  |
| `--with-form`      | Include React Hook Form + Zod validation                   |

## Generated Structure

### Feature (`--type feature`)

```
features/{name}/
  api/{name}Api.ts
  components/{Name}.tsx
  hooks/use{Name}.ts
  types/index.ts
  index.ts
```

### Component (`--type component`)

```
components/{Name}/
  {Name}.tsx
  {Name}.styles.ts (if >100 lines)
  index.ts
```

## Template Applied

- React.FC<Props> pattern
- useSuspenseQuery for data fetching
- SuspenseLoader wrapper
- Proper TypeScript types
- Import aliases (@/, ~types, ~components)
- MUI v7 Grid syntax
- useCallback for handlers
