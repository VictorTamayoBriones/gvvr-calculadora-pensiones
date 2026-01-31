export default function Dashboard() {
  return (
    <>
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <h3 className="font-semibold">Card 1</h3>
          <p className="text-sm text-muted-foreground">Contenido aquí</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <h3 className="font-semibold">Card 2</h3>
          <p className="text-sm text-muted-foreground">Contenido aquí</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <h3 className="font-semibold">Card 3</h3>
          <p className="text-sm text-muted-foreground">Contenido aquí</p>
        </div>
      </div>
      <div className="flex-1 rounded-xl bg-muted/50 p-4">
        <h3 className="font-semibold mb-2">Contenido principal</h3>
        <p className="text-sm text-muted-foreground">
          Aquí va el contenido principal de tu aplicación
        </p>
      </div>
    </>
  )
}
