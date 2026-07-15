import { ThemeTokens } from '../../theme/tokens';

interface AvatarProps {
  t: ThemeTokens;
  name: string;
  size?: number;
}

const ROTATION = ['#b91c1c', '#1d4ed8', '#15803d', '#a16207', '#7c3aed'];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % ROTATION.length;
  }
  return ROTATION[hash];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ t, name, size = 28 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colorFor(name),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
        border: `1px solid ${t.border}`,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}
