//
//  FirebaseManager.swift
//  FirebaseBackend
//
//  Created by AAA on 2/28/17.
//  Copyright © 2017 AAA. All rights reserved.
//

import UIKit
import Firebase

class FirebaseManager: NSObject {
    static let sharedInstance = FirebaseManager()

    func getCurrentUser(key: String!) {
        let dbRef = FIRDatabase.database().reference()
        let dbUserRef = dbRef.child("users").child(key)
        
        dbUserRef.observe(FIRDataEventType.value, with: {(snapshot) in
            let dict = snapshot.value as? NSDictionary
            print(dict)
        })
    }
    
    func updateUserData(id:String!, data:NSDictionary) {
        let dbRef = FIRDatabase.database().reference()
        let dbUserRef = dbRef.child("users").child(id)
        
        dbUserRef.setValue(data)
    }
    
    func updateUserData(id:String, key:String!, data: String?) {
        let dbRef = FIRDatabase.database().reference()
        let dbUserRef = dbRef.child("users").child(id).child(key)
        dbUserRef.updateChildValues([key: data ?? ""])
    }

}
