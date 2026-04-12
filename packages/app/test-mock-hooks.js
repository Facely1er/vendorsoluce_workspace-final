// Test the mock hooks
import { useVendorAssessments } from './src/hooks/useVendorAssessments.mock.js';
import { useVendors } from './src/hooks/useVendors.mock.js';

console.log('Testing mock hooks...');

// Test useVendorAssessments
const assessments = useVendorAssessments();
console.log('Vendor Assessments:', assessments.assessments.length, 'assessments');
console.log('Frameworks:', assessments.frameworks.length, 'frameworks');
console.log('Loading:', assessments.loading);
console.log('Error:', assessments.error);

// Test useVendors
const vendors = useVendors();
console.log('Vendors:', vendors.vendors.length, 'vendors');
console.log('Loading:', vendors.loading);
console.log('Error:', vendors.error);

console.log('Mock hooks test completed successfully!');