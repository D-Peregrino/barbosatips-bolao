type Props = { id?: string; data: unknown };

/** Injeta JSON-LD no documento (Server Component). */
export function JsonLdScript({ id = "json-ld", data }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- Schema.org
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
