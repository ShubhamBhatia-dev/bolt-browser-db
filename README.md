# Bolt Library: 🌟 A Lightweight IndexedDB Library

Bolt is a JavaScript library for working with 🗂️ IndexedDB in a MongoDB-like manner. It simplifies 🛠️ IndexedDB operations by offering methods for creating 📁 databases, performing CRUD operations ✍️, aggregations 📊, and summations ➕.

---

## Features 🚀

### **1. Installation && Initialization 🛠️**

The library automatically initializes a 🗂️ database for a given store name. If the database or store does not exist, it creates one automatically.

#### Example:
```javascript
npm install bolt-browser-db
```

```javascript
import Bolt from "bolt-browser-db"
const db = new Bolt('MyStore');
```

Output:

```plaintext
Database 'MyStore' and store 'MyStore' created. ✅
```

---

### **2. Insert One ➕**

Inserts a single 📄 document into the store.

#### Example:

```javascript
await db.insertOne({ name: 'Alice', age: 25 });
```

Output:

```plaintext
Document inserted with ID: 1 ✅
```

---

### **3. Insert Many 📋**

Inserts multiple 📄📄 documents into the store.

#### Example:

```javascript
await db.insertMany([
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
]);
```

Output:

```plaintext
Documents inserted with IDs: [2, 3] ✅
```

---

### **4. Find One 🔍**

Finds a single 📄 document matching a given query.

#### Example:

```javascript
const user = await db.findOne({ name: 'Alice' });
console.log(user);
```

Output:

```javascript
{ _id: 1, name: 'Alice', age: 25 } ✅
```

---

### **5. Find 🔎**

Finds all 📄📄 documents matching a given query.

#### Example:

```javascript
const users = await db.find({ age: 30 });
console.log(users);
```

Output:

```javascript
[{ _id: 2, name: 'Bob', age: 30 }] ✅
```

---

### **6. Update ♻️**

Updates 📄📄 documents matching a query with new values.

#### Example:

```javascript
await db.update({ name: 'Alice' }, { age: 26 });
```

Output:

```plaintext
Updated documents: [{ _id: 1, name: 'Alice', age: 26 }] ✅
```

---

### **7. Delete ❌**

Deletes 📄📄 documents matching a query.

#### Example:

```javascript
await db.delete({ age: 35 });
```

Output:

```plaintext
Deleted 1 document(s). ✅
```

---

### **8. Sum ➕**

Calculates the sum of a field for 📄📄 documents matching a condition.

#### Example:

```javascript
const totalAge = await db.sum('age', { name: 'Alice' });
console.log(totalAge);
```

Output:

```plaintext
Total age: 26 ✅
```

---

### **9. Aggregate 📊**

Performs advanced data aggregation.

#### Example:

```javascript
const result = await db.aggregate([
  { $match: { age: { $gte: 30 } } },
  { $group: { _id: 'age', totalAge: { initial: 0, totalAge: 'age' } } }
]);
console.log(result);
```

Output:

```javascript
[{ _id: 'age', totalAge: 65 }] ✅
```

---

## How to Use 🧑‍💻

1. Include the Bolt library in your project.
2. Initialize it with a store name 📁.
3. Use its methods for CRUD operations ✍️ and advanced queries 🔍.

---

## Limitations ⚠️

- Each store is represented as a separate database.
- No native support for joins or cross-store queries.

---

## Full Example 🏗️

```javascript
(async () => {
  const db = new Bolt('ExampleStore');

  // Insert data ➕
  await db.insertOne({ name: 'Alice', age: 25 });
  await db.insertMany([
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 }
  ]);

  // Query data 🔍
  console.log(await db.findOne({ name: 'Alice' }));
  console.log(await db.find({ age: 30 }));

  // Update data ♻️
  await db.update({ name: 'Alice' }, { age: 26 });

  // Sum ages ➕
  const totalAge = await db.sum('age');
  console.log(`Total age: ${totalAge}`);

  // Aggregate data 📊
  const aggregated = await db.aggregate([
    { $match: { age: { $gte: 25 } } },
    { $group: { _id: 'total', sumAge: { $sum: 'age' } } }
  ]);
  console.log(aggregated);

  // Delete data ❌
  await db.delete({ name: 'Bob' });
})();
```
