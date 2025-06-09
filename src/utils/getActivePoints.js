// @/utils/getActivePoints.js

export async function getTotalActivePoints(supabase, userId, pointsType) {
	if (!supabase) {
        throw new Error("Supabase client instance is required.");
    }
	if (!userId || !pointsType) {
	  throw new Error("User ID and points type are required.");
	}
  
	const now = new Date();
  
	
	const { data: packages, error } = await supabase
	  .from('pointsorders')
	  .select(`created_at, lifespan, ${pointsType}`) 
	  .eq('user', userId)
	  .eq('status', 'Активен') // Explicitly filter by 'Активен' status
	  .gt(pointsType, 0); // Only consider packages that have points of this type
  
	if (error) {
	  console.error(`Error fetching active points for ${userId}, type ${pointsType}:`, error);
	  throw new Error(`Database error fetching active points: ${error.message}`);
	}
  
	if (!packages || packages.length === 0) {
	  return 0; 
	}
  
	let totalActivePoints = 0;
  
	for (const pkg of packages) {
	  if (pkg.created_at && typeof pkg.lifespan === 'number') {
		const createdAt = new Date(pkg.created_at);
		const expiryDate = new Date(createdAt.getTime()); 
		expiryDate.setDate(createdAt.getDate() + pkg.lifespan);
  
		if (expiryDate >= now) {
		  totalActivePoints += Number(pkg[pointsType] || 0);
		} else {
		  console.warn(`Package ID (if available, not selected) for user ${userId} has status 'Активен' but appears expired by lifespan. Created: ${createdAt}, Lifespan: ${pkg.lifespan} days.`);
		}
	  }
	}
	console.log(`Total active ${pointsType} for user ${userId}: ${totalActivePoints}`);
	return totalActivePoints;
  }