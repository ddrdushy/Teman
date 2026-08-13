/** Initials on teal when there's no photo — never a generic silhouette,
 *  which reads as absence. */
export function Avatar({ name, photoUrl, size = 'md' }: {
  name: string;
  photoUrl?: string;
  size?: 'md' | 'lg';
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '·';
  const cls = ['avatar', size === 'lg' ? 'avatar-lg' : ''].join(' ').trim();
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className={cls} style={{ objectFit: 'cover' }} />;
  }
  return <span className={cls} aria-hidden="true">{initial}</span>;
}

/** For circles and trusted sets. `moreLabel` is the caller's translated
 *  "+5" equivalent so the overflow chip still carries words. */
export function AvatarGroup({ names, max = 3, moreLabel }: {
  names: string[];
  max?: number;
  moreLabel?: string;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-group">
      {shown.map((n, i) => <Avatar key={i} name={n} />)}
      {extra > 0 && <span className="avatar avatar-more">{moreLabel ?? `+${extra}`}</span>}
    </span>
  );
}
