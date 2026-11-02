import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpia todo para poder correr el seed varias veces
  await prisma.ordenItem.deleteMany();
  await prisma.orden.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  const nombresCategorias = [
    'Espadas y hojas',
    'Bastones y báculos',
    'Arcos y ballestas',
    'Armaduras y escudos',
    'Pergaminos de conjuros',
    'Pociones y elixires',
    'Amuletos y anillos',
  ];

  const cat = {};
  for (const nombre of nombresCategorias) {
    const c = await prisma.categoria.create({ data: { nombre } });
    cat[nombre] = c.id;
  }

  // Usuarios de prueba (contraseñas solo para desarrollo local)
  await prisma.usuario.create({
    data: {
      nombre: 'Maestro Herrero',
      email: 'admin@forja.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      rol: 'admin',
      nivel: 99,
      oro: 999999,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: 'Aventurero de Prueba',
      email: 'aventurero@forja.com',
      passwordHash: await bcrypt.hash('aventura123', 10),
      clase: 'guerrero',
      nivel: 5,
    },
  });

  const productos = [
    {
      nombre: 'Filo del Alba',
      descripcion: 'Espada forjada con la primera luz del día en el templo de Aurelion.',
      precio: 4500, stock: 2, rareza: 'legendario', elemento: 'sagrado',
      nivelRequerido: 20, poder: 95,
      encantamiento: 'Brilla en presencia de no-muertos',
      categoria: 'Espadas y hojas',
    },
    {
      nombre: 'Hoja del Cuervo',
      descripcion: 'Daga ligera usada por los asesinos del Gremio Nocturno.',
      precio: 800, stock: 10, rareza: 'raro', elemento: 'sombra',
      nivelRequerido: 8, poder: 55,
      encantamiento: 'Sus golpes no hacen ruido',
      categoria: 'Espadas y hojas',
    },
    {
      nombre: 'Báculo de Escarcha Eterna',
      descripcion: 'Tallado en hielo que jamás se derrite, extraído de los picos de Valdrin.',
      precio: 3200, stock: 3, rareza: 'epico', elemento: 'hielo',
      nivelRequerido: 15, poder: 80,
      encantamiento: 'Congela el aire a su alrededor',
      categoria: 'Bastones y báculos',
    },
    {
      nombre: 'Vara del Aprendiz',
      descripcion: 'Sencilla vara de roble, ideal para dar los primeros pasos en la magia.',
      precio: 150, stock: 25, rareza: 'comun', elemento: null,
      nivelRequerido: 1, poder: 15,
      encantamiento: null,
      categoria: 'Bastones y báculos',
    },
    {
      nombre: 'Arco de Sylvaren',
      descripcion: 'Tallado por los elfos del bosque antiguo de Sylvaren.',
      precio: 1800, stock: 5, rareza: 'raro', elemento: null,
      nivelRequerido: 10, poder: 70,
      encantamiento: 'Nunca falla bajo la luz de la luna',
      categoria: 'Arcos y ballestas',
    },
    {
      nombre: 'Ballesta del Trueno',
      descripcion: 'Ballesta enana con runas que retumban en cada disparo.',
      precio: 2600, stock: 4, rareza: 'epico', elemento: 'rayo',
      nivelRequerido: 14, poder: 75,
      encantamiento: 'Cada virote libera una descarga eléctrica',
      categoria: 'Arcos y ballestas',
    },
    {
      nombre: 'Escudo del Bastión',
      descripcion: 'Escudo de los paladines que defendieron la ciudadela de Kharos.',
      precio: 1200, stock: 6, rareza: 'raro', elemento: 'sagrado',
      nivelRequerido: 9, poder: 40,
      encantamiento: 'Repele maldiciones menores',
      categoria: 'Armaduras y escudos',
    },
    {
      nombre: 'Pergamino de Bola de Fuego',
      descripcion: 'Conjuro clásico de destrucción. Un solo uso.',
      precio: 300, stock: 30, rareza: 'comun', elemento: 'fuego',
      nivelRequerido: 3, poder: 60,
      encantamiento: null,
      categoria: 'Pergaminos de conjuros',
    },
    {
      nombre: 'Pergamino de Cadena de Rayos',
      descripcion: 'El rayo salta entre varios enemigos cercanos. Un solo uso.',
      precio: 900, stock: 12, rareza: 'raro', elemento: 'rayo',
      nivelRequerido: 10, poder: 70,
      encantamiento: null,
      categoria: 'Pergaminos de conjuros',
    },
    {
      nombre: 'Elixir de Sombras',
      descripcion: 'Líquido oscuro que se agita solo dentro del frasco.',
      precio: 450, stock: 20, rareza: 'raro', elemento: 'sombra',
      nivelRequerido: 5, poder: 0,
      encantamiento: 'Invisibilidad durante diez minutos',
      categoria: 'Pociones y elixires',
    },
    {
      nombre: 'Poción de Vida Mayor',
      descripcion: 'Restaura las heridas más graves en segundos.',
      precio: 120, stock: 50, rareza: 'comun', elemento: null,
      nivelRequerido: 1, poder: 0,
      encantamiento: null,
      categoria: 'Pociones y elixires',
    },
    {
      nombre: 'Anillo del Fénix',
      descripcion: 'Contiene una pluma del último fénix de las Tierras Ígneas.',
      precio: 5000, stock: 1, rareza: 'legendario', elemento: 'fuego',
      nivelRequerido: 25, poder: 50,
      encantamiento: 'Revive a su portador una vez',
      categoria: 'Amuletos y anillos',
    },
  ];

  for (const p of productos) {
    const { categoria, ...datos } = p;
    await prisma.producto.create({
      data: { ...datos, categoriaId: cat[categoria] },
    });
  }

  console.log(`Seed listo: ${nombresCategorias.length} categorías, ${productos.length} productos, 2 usuarios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());