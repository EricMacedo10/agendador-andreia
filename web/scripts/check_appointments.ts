
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const appointments = await prisma.appointment.findMany({
        include: { client: true, services: { include: { service: true } } }
    })
    console.log('Appointments found:', appointments.length)
    appointments.forEach(a => {
        const serviceNames = a.services.map(s => s.service.name).join(', ')
        console.log(`- ${a.date.toISOString()} | ${a.client.name} | ${serviceNames}`)
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
