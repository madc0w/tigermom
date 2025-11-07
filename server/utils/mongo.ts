import { Collection, Db, MongoClient, type Document } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

function getEnv(name: string, fallback?: string): string {
	const v = process.env[name] ?? fallback;
	if (!v) throw new Error(`Missing required environment variable: ${name}`);
	return v;
}

export async function getDb(): Promise<Db> {
	if (db) return db;

	const uri = getEnv('MONGODB_URI', 'mongodb://localhost:27017');
	const dbName = getEnv('MONGODB_DB', 'app');

	if (!client) {
		client = new MongoClient(uri);
	}
	// Connect once when initializing the DB handle
	await client.connect();
	db = client.db(dbName);
	return db;
}

export async function getCollection<T extends Document = Document>(
	name: string
): Promise<Collection<T>> {
	const d = await getDb();
	return d.collection<T>(name);
}

export interface UserDoc extends Document {
	_id?: any;
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
	passwordHash: string;
	createdAt: Date;
}
