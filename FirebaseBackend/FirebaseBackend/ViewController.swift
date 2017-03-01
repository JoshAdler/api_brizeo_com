//
//  ViewController.swift
//  FirebaseBackend
//
//  Created by AAA on 2/28/17.
//  Copyright © 2017 AAA. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func getCurrentUser(_ sender: Any) {
        FirebaseManager.sharedInstance.getCurrentUser(key: "1003543936419776")
    }

}

