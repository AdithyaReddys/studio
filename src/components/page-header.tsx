type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
