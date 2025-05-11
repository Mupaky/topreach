import { createClient } from "@/utils/client";

const supabase = createClient();

export async function getTotalActivePoints(userId, pointsType) {
	if (!userId || !pointsType) {
	  throw new Error("User ID and points type are required.");
	}
  
	const now = new Date();
  
	// Fetch packages that are explicitly marked 'Активен' (Active)
	// and have some points of the specified type.
	const { data: packages, error } = await supabase
	  .from('pointsorders')
	  .select(`created_at, lifespan, ${pointsType}`) // Select only necessary fields
	  .eq('user', userId)
	  .eq('status', 'Активен') // Explicitly filter by 'Активен' status
	  .gt(pointsType, 0); // Only consider packages that have points of this type
  
	if (error) {
	  console.error(`Error fetching active points for ${userId}, type ${pointsType}:`, error);
	  throw new Error(`Database error fetching active points: ${error.message}`);
	}
  
	if (!packages || packages.length === 0) {
	  return 0; // No active packages with this point type
	}
  
	let totalActivePoints = 0;
  
	for (const pkg of packages) {
	  if (pkg.created_at && typeof pkg.lifespan === 'number') {
		const createdAt = new Date(pkg.created_at);
		// Create a new date object for expiry calculation to avoid mutating createdAt
		const expiryDate = new Date(createdAt.getTime()); 
		expiryDate.setDate(createdAt.getDate() + pkg.lifespan);
  
		// Check if the package is not expired
		if (expiryDate >= now) {
		  totalActivePoints += Number(pkg[pointsType] || 0);
		} else {
		  // Optional: If a package is 'Активен' but its lifespan implies it's expired,
		  // you might want to log this or even have a background job to update its status.
		  console.warn(`Package ID (if available, not selected) for user ${userId} has status 'Активен' but appears expired by lifespan. Created: ${createdAt}, Lifespan: ${pkg.lifespan} days.`);
		}
	  }
	}
	console.log(`Total active ${pointsType} for user ${userId}: ${totalActivePoints}`);
	return totalActivePoints;
  }