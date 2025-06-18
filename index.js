import { MongoClient } from 'mongodb';

// Bağlantı URI'sini buraya yapıştır
const uri = "mongodb+srv://23480262:z3SFTXXHHxUPm9NX@cluster0.jmfxiti.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB'ye başarıyla bağlanıldı!");

    const db = client.db("ornekVeritabani");
    const collection = db.collection("kullanicilar");

    const yeniKullanici = { ad: "Tuğçe", yas: 25 };
    const sonuc = await collection.insertOne(yeniKullanici);
    console.log("✅ Veri eklendi:", sonuc.insertedId);

    const veriler = await collection.find().toArray();
    console.log("📦 Veriler:", veriler);

  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await client.close();
  }
}

run(); 