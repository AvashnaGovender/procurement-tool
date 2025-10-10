import { prisma } from '@/lib/prisma'

async function checkDeletedSuppliers() {
  try {
    // Get all suppliers
    const allSuppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        companyName: true,
        contactEmail: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n📊 Total suppliers in database: ${allSuppliers.length}\n`)
    
    // Group by email to find duplicates
    const emailMap = new Map<string, typeof allSuppliers>()
    
    allSuppliers.forEach(supplier => {
      if (!emailMap.has(supplier.contactEmail)) {
        emailMap.set(supplier.contactEmail, [])
      }
      emailMap.get(supplier.contactEmail)!.push(supplier)
    })

    // Find duplicate emails
    const duplicates = Array.from(emailMap.entries()).filter(([_, suppliers]) => suppliers.length > 1)
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate email(s):\n`)
      
      duplicates.forEach(([email, suppliers]) => {
        console.log(`📧 Email: ${email}`)
        console.log(`   ${suppliers.length} suppliers found:`)
        suppliers.forEach(s => {
          console.log(`   - ID: ${s.id}`)
          console.log(`     Company: ${s.companyName}`)
          console.log(`     Status: ${s.status}`)
          console.log(`     Created: ${s.createdAt.toISOString()}`)
          console.log('')
        })
      })
    } else {
      console.log('✅ No duplicate emails found in database')
    }

    // List all suppliers
    console.log('\n📋 All Suppliers:')
    allSuppliers.forEach(s => {
      console.log(`   ${s.contactEmail} - ${s.companyName} (${s.status}) - ID: ${s.id}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDeletedSuppliers()

