/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { Stack } from 'aws-cdk-lib';
import {
  // Match,
  Template
} from 'aws-cdk-lib/assertions';
import { ConstructsFactories } from "../../lib";
import * as defaults from "@aws-solutions-constructs/core/lib/kms-helper";
// import * as kms from 'aws-cdk-lib/aws-kms';

test('All defaults', () => {
  const stack = new Stack();

  const factories = new ConstructsFactories(stack, 'target');

  const newTopicConstruct = factories.snsTopicFactory('testTopic', {});

  expect(newTopicConstruct.topic).toBeDefined();

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);
  template.resourceCountIs("AWS::SNS::TopicPolicy", 1);

  template.hasResourceProperties("AWS::SNS::Topic", {
    KmsMasterKeyId: {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            Ref: "AWS::Partition"
          },
          ":kms:",
          {
            Ref: "AWS::Region"
          },
          ":",
          {
            Ref: "AWS::AccountId"
          },
          ":alias/aws/sns"
        ]
      ]
    }
  });
});

// --------------------------------------------------------------
// Test deployment without imported encryption key
// --------------------------------------------------------------
test('Test deployment without imported encryption key', () => {
  // Stack
  const stack = new Stack();

  const factories = new ConstructsFactories(stack, 'target');

  const newTopicConstruct = factories.snsTopicFactory('testTopic', {
    topicProps: {
      topicName: "custom-topic"
    },
    enableEncryptionWithCustomerManagedKey: true
  });

  expect(newTopicConstruct.topic).toBeDefined();

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::SNS::Topic", {
    TopicName: "custom-topic"
  });
  // Assertion 3
  template.hasResourceProperties("AWS::KMS::Key", {
    EnableKeyRotation: true
  });
});

test('Test deployment w/ imported encryption key', () => {
  const stack = new Stack();

  const factories = new ConstructsFactories(stack, 'target');

  // Generate KMS Key
  const key = defaults.buildEncryptionKey(stack, 'key-test');

  const newTopicConstruct = factories.snsTopicFactory('testTopic', {
    topicProps: {
      topicName: "custom-topic"
    },
    enableEncryptionWithCustomerManagedKey: true,
    encryptionKey: key
  });

  expect(newTopicConstruct.topic).toBeDefined();
  expect(newTopicConstruct.key).toBeDefined();

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);
  template.resourceCountIs("AWS::SNS::TopicPolicy", 1);

  template.hasResourceProperties("AWS::SNS::Topic", {
    KmsMasterKeyId: {
      "Fn::GetAtt": [
        "keytestKey8AE2FF0A",
        "Arn"
      ]
    },
    TopicName: "custom-topic"
  });

});