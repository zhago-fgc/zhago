package database

import bolt "go.etcd.io/bbolt"

var Connection = initDatabaseConnection()

func initDatabaseConnection() *bolt.DB {
	db, err := bolt.Open("./zhago.db", 0600, nil)
	if err != nil {
		panic("could not create the database")
	}

	err = db.Update(func(tx *bolt.Tx) error {
		buckets := []string{"events"}
		for _, bucket := range buckets {
			if _, err := tx.CreateBucketIfNotExists([]byte(bucket)); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		panic("could not create buckets")
	}

	return db
}
