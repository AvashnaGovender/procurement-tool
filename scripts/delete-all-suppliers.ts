import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllSuppliers() {
  try {
    console.log('Starting supplier deletion process...\n');
    
    // Count existing records
    const supplierCount = await prisma.supplier.count();
    const onboardingCount = await prisma.supplierOnboarding.count();
    const timelineCount = await prisma.onboardingTimeline.count();
    const evaluationCount = await prisma.supplierEvaluation.count();
    const reviewCount = await prisma.supplierReview.count();
    const documentCount = await prisma.supplierDocument.count();
    const initiationCount = await prisma.supplierInitiation.count();
    const managerApprovalCount = await prisma.managerApproval.count();
    const procurementApprovalCount = await prisma.procurementApproval.count();
    
    console.log('Current database state:');
    console.log(`- Suppliers: ${supplierCount}`);
    console.log(`- Supplier Onboardings: ${onboardingCount}`);
    console.log(`- Onboarding Timeline Entries: ${timelineCount}`);
    console.log(`- Supplier Evaluations: ${evaluationCount}`);
    console.log(`- Supplier Reviews: ${reviewCount}`);
    console.log(`- Supplier Documents: ${documentCount}`);
    console.log(`- Supplier Initiations: ${initiationCount}`);
    console.log(`- Manager Approvals: ${managerApprovalCount}`);
    console.log(`- Procurement Approvals: ${procurementApprovalCount}`);
    console.log('');
    
    if (supplierCount === 0 && initiationCount === 0) {
      console.log('No suppliers or initiations found in the database. Nothing to delete.');
      return;
    }
    
    console.log('⚠️  WARNING: This will delete ALL suppliers, initiations, and related records!');
    console.log('Proceeding with deletion in 3 seconds...\n');
    
    // Wait 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete in the correct order to respect foreign key constraints
    
    // First, delete supplier initiation approvals (cascade should handle this, but being explicit)
    console.log('Deleting procurement approvals...');
    const deletedProcurementApprovals = await prisma.procurementApproval.deleteMany({});
    console.log(`✓ Deleted ${deletedProcurementApprovals.count} procurement approvals`);
    
    console.log('Deleting manager approvals...');
    const deletedManagerApprovals = await prisma.managerApproval.deleteMany({});
    console.log(`✓ Deleted ${deletedManagerApprovals.count} manager approvals`);
    
    console.log('Deleting supplier initiations...');
    const deletedInitiations = await prisma.supplierInitiation.deleteMany({});
    console.log(`✓ Deleted ${deletedInitiations.count} supplier initiations`);
    console.log('Deleting onboarding timeline entries...');
    const deletedTimeline = await prisma.onboardingTimeline.deleteMany({});
    console.log(`✓ Deleted ${deletedTimeline.count} onboarding timeline entries`);
    
    console.log('Deleting email reminders...');
    const deletedReminders = await prisma.emailReminder.deleteMany({});
    console.log(`✓ Deleted ${deletedReminders.count} email reminders`);
    
    console.log('Deleting verification checks...');
    const deletedChecks = await prisma.verificationCheck.deleteMany({});
    console.log(`✓ Deleted ${deletedChecks.count} verification checks`);
    
    console.log('Deleting supplier documents...');
    const deletedDocs = await prisma.supplierDocument.deleteMany({
      where: { onboardingId: { not: null } }
    });
    console.log(`✓ Deleted ${deletedDocs.count} supplier documents`);
    
    console.log('Deleting supplier onboarding records...');
    const deletedOnboardings = await prisma.supplierOnboarding.deleteMany({});
    console.log(`✓ Deleted ${deletedOnboardings.count} supplier onboarding records`);
    
    console.log('Deleting supplier evaluations...');
    const deletedEvaluations = await prisma.supplierEvaluation.deleteMany({});
    console.log(`✓ Deleted ${deletedEvaluations.count} supplier evaluations`);
    
    console.log('Deleting supplier reviews...');
    const deletedReviews = await prisma.supplierReview.deleteMany({});
    console.log(`✓ Deleted ${deletedReviews.count} supplier reviews`);
    
    console.log('Deleting suppliers...');
    const deletedSuppliers = await prisma.supplier.deleteMany({});
    console.log(`✓ Deleted ${deletedSuppliers.count} suppliers`);
    
    console.log('\n✅ Successfully deleted all suppliers, initiations, and related records!');
    
    // Verify deletion
    const remainingSuppliers = await prisma.supplier.count();
    const remainingOnboardings = await prisma.supplierOnboarding.count();
    const remainingTimeline = await prisma.onboardingTimeline.count();
    const remainingInitiations = await prisma.supplierInitiation.count();
    const remainingManagerApprovals = await prisma.managerApproval.count();
    const remainingProcurementApprovals = await prisma.procurementApproval.count();
    
    console.log('\nFinal database state:');
    console.log(`- Suppliers: ${remainingSuppliers}`);
    console.log(`- Supplier Onboardings: ${remainingOnboardings}`);
    console.log(`- Onboarding Timeline: ${remainingTimeline}`);
    console.log(`- Supplier Initiations: ${remainingInitiations}`);
    console.log(`- Manager Approvals: ${remainingManagerApprovals}`);
    console.log(`- Procurement Approvals: ${remainingProcurementApprovals}`);
    
  } catch (error) {
    console.error('Error deleting suppliers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
deleteAllSuppliers()
  .then(() => {
    console.log('\nDeletion process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDeletion process failed:', error);
    process.exit(1);
  });

