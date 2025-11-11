const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get environment variables
function getEnv(name, fallback) {
	const v = process.env[name] ?? fallback;
	if (!v) throw new Error(`Missing required environment variable: ${name}`);
	return v;
}

// Parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
	const result = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}
	result.push(current.trim());

	return result;
}

// Main import function
async function importTutors(csvFilePath) {
	let client = null;

	try {
		// Check if file exists
		if (!fs.existsSync(csvFilePath)) {
			throw new Error(`File not found: ${csvFilePath}`);
		}

		console.log(`📁 Reading CSV file: ${csvFilePath}`);

		// Connect to MongoDB
		const uri = getEnv('MONGODB_URI');
		const dbName = getEnv('MONGODB_DB');

		console.log('🔌 Connecting to MongoDB...');
		client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 10000,
		});

		await client.connect();
		const db = client.db(dbName);
		const tutorsCollection = db.collection('tutors');

		console.log('✅ Connected to MongoDB');

		// Read and parse CSV file
		const fileStream = fs.createReadStream(csvFilePath);
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});

		let headers = [];
		let lineNumber = 0;
		let importedCount = 0;
		let errorCount = 0;

		for await (const line of rl) {
			lineNumber++;

			// Skip empty lines
			if (!line.trim()) continue;

			// First line is headers
			if (lineNumber === 1) {
				headers = parseCSVLine(line);
				console.log(`📋 CSV Headers: ${headers.join(', ')}`);
				continue;
			}

			try {
				const values = parseCSVLine(line);

				// Create tutor object from CSV row
				const tutor = {};
				headers.forEach((header, index) => {
					const value = values[index] || '';

					// Handle special fields
					if (header === 'categories') {
						// Split categories by semicolon or pipe
						tutor[header] = value
							.split(/[;|]/)
							.map((cat) => cat.trim())
							.filter(Boolean);
					} else if (header === 'hourlyRate') {
						// Parse as number
						const rate = parseFloat(value);
						if (!isNaN(rate)) {
							tutor[header] = rate;
						}
					} else if (value) {
						tutor[header] = value;
					}
				});

				// Validate required fields
				if (!tutor.firstName || !tutor.lastName || !tutor.email) {
					console.warn(
						`⚠️  Line ${lineNumber}: Missing required fields (firstName, lastName, or email)`
					);
					errorCount++;
					continue;
				}

				// Add createdAt timestamp
				tutor.createdAt = new Date();

				// Insert into database
				await tutorsCollection.insertOne(tutor);
				importedCount++;

				console.log(
					`✓ Imported: ${tutor.firstName} ${tutor.lastName} (${tutor.email})`
				);
			} catch (error) {
				console.error(`❌ Error on line ${lineNumber}:`, error.message);
				errorCount++;
			}
		}

		console.log('\n📊 Import Summary:');
		console.log(`   Total imported: ${importedCount}`);
		console.log(`   Errors: ${errorCount}`);
		console.log(`   Total lines processed: ${lineNumber - 1}`);
	} catch (error) {
		console.error('❌ Import failed:', error.message);
		process.exit(1);
	} finally {
		if (client) {
			await client.close();
			console.log('🔌 MongoDB connection closed');
		}
	}
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length === 0) {
	console.error('Usage: node importTutors.cjs <csv-file-path>');
	console.error('\nExample CSV format:');
	console.error('firstName,lastName,email,phone,categories,bio,hourlyRate');
	console.error(
		'John,Doe,john@example.com,555-1234,math.algebra;languages.french,Experienced tutor,50'
	);
	process.exit(1);
}

const csvFilePath = path.resolve(args[0]);
importTutors(csvFilePath);
