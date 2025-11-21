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

// Note: To ensure CDKv2 compatibility, keep the import statement for Construct separate
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as defaults from '@aws-solutions-constructs/core';

export interface SnsTopicFactoryProps {
    /**
     * Optional user provided props to override the default props for the SNS topic.
     *
     * @default - Default props are used.
     */
    readonly topicProps?: sns.TopicProps;

    /**
     * If no key is provided, this flag determines whether the topic is encrypted with a new CMK or an AWS managed key.
     * This flag is ignored if any of the following are defined: topicProps.masterKey, encryptionKey or encryptionKeyProps.
     *
     * @default - False if topicProps.masterKey, encryptionKey, and encryptionKeyProps are all undefined.
     */
    readonly enableEncryptionWithCustomerManagedKey?: boolean;

    /**
     * An optional, imported encryption key to encrypt the SNS topic with.
     *
     * @default - None
     */
    readonly encryptionKey?: kms.Key;

    /**
     * Optional user provided properties to override the default properties for the KMS encryption key used to encrypt the SNS topic with.
     *
     * @default - None
     */
    readonly encryptionKeyProps?: kms.KeyProps;
}

export interface SnsTopicFactoryResponse {
  readonly topic: sns.Topic,
  readonly key?: kms.IKey,
}

export class TopicFactory {

  public static factory(scope: Construct, id: string, props: SnsTopicFactoryProps): SnsTopicFactoryResponse {
      defaults.CheckSnsProps(props);

      let enableEncryptionParam = props.enableEncryptionWithCustomerManagedKey;
      if (props.enableEncryptionWithCustomerManagedKey === undefined || props.enableEncryptionWithCustomerManagedKey) {
          enableEncryptionParam = true;
      }

      // Setup the sns topic.
      const buildTopicResponse = defaults.buildTopic(scope, id, {
          topicProps: props.topicProps,
          enableEncryptionWithCustomerManagedKey: enableEncryptionParam,
          encryptionKey: props.encryptionKey,
          encryptionKeyProps: props.encryptionKeyProps
      });

      return {
          topic: buildTopicResponse.topic,
          key: buildTopicResponse.key,
      };
  }
}
