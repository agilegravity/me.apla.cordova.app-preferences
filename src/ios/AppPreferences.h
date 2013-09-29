//
//  applicationPreferences.h
//  
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <Cordova/CDV.h>

@interface AppPreferences : CDVPlugin 

- (void)getValue:(CDVInvokedUrlCommand*)command;
- (void)setValue:(CDVInvokedUrlCommand*)command;
- (NSString*)getValueFromBundle:(NSString*)settingsName;


@end
