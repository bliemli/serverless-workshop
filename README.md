# Level Up Your Serverless Game

This workshop consists of multiple levels of increasing difficulty. The basic track of this course uses the AWS Web Console. However, if you prefer working with the AWS CLI or with Terraform you may switch to one of these technologies at any stage in the course. If you stay on the basic track, there is nothing to install on your machine. If you want to switch to the CLI or to Terraform, you need to follow the optional installation instructions below.

## Preparation

At the start of the course, please take care of the following tasks.

### Test your AWS login

You have received an AWS Account ID, a user name and a password from the trainers. Please navigate to `https://aws.amazon.com/`, click the button `Sign In to the Console` and enter your credentials. You should be able to log in to the console. From there you should be able to reach the service `Lambda`.

### Optional: install the AWS CLI

#### Installation

If you want to also work on some of the optional extra topics of this course, you need to install the AWS CLI on your machine. Please follow the [AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and choose the installation method best suited for your operating system.

#### Authentication

In order to authenticate your CLI you need to first create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
2. Click on your name in the top right of the screen
3. Click `My Security Credentials` in the dropdown
4. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`
5. Download the access key ID and the secret access key as a CSV file or copy them

Then you need to configure your CLI with access key ID and the secret access key

6. Type `aws configure` in your terminal
7. Enter your access key ID and the secret access key at the prompts
8. Choose `eu-central-1` as the default region name and a default output format (e.g. `eu-central-1`)
9. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

### Optional: install Terraform

Some optional extra topics also require Terraform, which you need to install on your machine. Please follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

## Level 0 - This is easy!

In this level you will learn how to create a first simple function in AWS Lambda. You will also learn how to pass configuration parameters into a function using environment variables. Furthermore, you will see that AWS has a very strict, deny-by-default authorization scheme.

### Steps

Please work through the following steps:

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Create function`
1. Choose `my-function-AWSUSER` as the function name, replacing `AWSUSER` with you user name.
1. Choose `Node.js 14.x` as the runtime
1. Open the section `Change default execution role` and note that the UI automatically creates an execution role behind the scenes, granting the function certain privileges.
1. Click on `Create function`
1. Copy the code from [./level-0/function/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-0/function/index.js) and paste it into the code editor field
1. Press the `Deploy` button
1. Set environment variable `NAME` in the `Configuration` tab under `Environment variables`
1. Press the `Test` button and create a test event called `test`
1. Press the `Test` button again to run the test
1. Observe the test output.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Set the AWSUSER environment variable.

```
export AWSUSER=<your AWS username>
```

2. Create an execution role which will allow Lambda functions to access AWS resources:

```
aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

3. Grant certain permissions to your newly created role. The managed policy `AWSLambdaBasicExecutionRole` has the permissions needed to write logs to CloudWatch:

```
aws iam attach-role-policy --role-name lambda-ex-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

4. Create a deployment package for your function:

```
zip -j function.zip level-0/index.js
```

5. Create the function:

```
export ACCOUNT_ID=<your account ID>

aws lambda create-function --function-name my-function-cli-"$AWSUSER" --zip-file file://function.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::"$ACCOUNT_ID":role/lambda-ex
```

6. Set the `NAME` environment variable to your user name:

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --environment "Variables={NAME='$AWSUSER'}"
```

7. Invoke the function:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail
```

8. Invoke the function and decode the logs:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail --query 'LogResult' --output text |  base64 -d
```

9. Clean up

```
aws lambda delete-function --function-name my-function-cli-"$AWSUSER"

aws iam delete-role --role-name lambda-ex-"$AWSUSER"
```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Navigate to the Terraform module

```
cd level-0/advanced/terraform
```

2. Initialize the Terraform module

```
terraform init
```

3. Set your AWS user name as a environment variable for Terraform

```
export TF_VAR_aws_user=<your AWS user name>
```

4. Apply the Terraform module

```
terraform apply
```

5. Invoke the function

```
aws lambda invoke --function-name=$(terraform output -raw function_name) response.json
```

6. Clean up

```
terraform destroy
```

</details>

## Level 1 - Loggin' it!

- Logging
- Event parameter
- Permissions

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
2. Click on `Create function`
3. Choose `myFunctionLogged-AWSUSER` as the function name, replacing `AWSUSER` with you user name.
4. Choose `Node.js 14.x` as the runtime
5. Open the section `Change default execution role` and note that the UI automatically creates an execution role behind the scenes, granting the function certain privileges for writing logs to CloudWatch
6. Click on `Create function`
7. Copy the code from [./level-1/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-1/index.js) and paste it into the code editor field
8. Press the `Deploy` button
9. Press the `Test` button and create a test event called `bob`
10. Paste the following JSON object to the editor field

```
{
  "name": "Bob"
}
```

11. Press the `Test` button again to run the test
12. Navigate to the tab `Monitor`
13. Click `View logs in CloudWatch`
14. Look for a recent log stream and open it
15. Check for lines looking like this

```
2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 INFO Bob invoked me

2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 ERROR Oh noes!
```

16. Navigate to the tab `Configuration` and click on the category `Permissions`.
17. Observe the logging permissions which were assigned to your function automatically.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Set the AWSUSER environment variable.

```
export AWSUSER=<your AWS username>
```

2. Create an execution role which will allow Lambda functions to access AWS resources:

```
aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

3. Grant certain permissions to your newly created role. The managed policy `AWSLambdaBasicExecutionRole` has the permissions needed to write logs to CloudWatch:

```
aws iam attach-role-policy --role-name lambda-ex-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

4. Create a deployment package for your function:

```
zip -j function.zip level-1/function/index.js
```

5. Create the function:

```
export ACCOUNT_ID=<your account ID>

aws lambda create-function --function-name my-function-cli-"$AWSUSER" --zip-file file://function.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::"$ACCOUNT_ID":role/lambda-ex
```

6. Set the `NAME` environment variable to your user name:

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --environment "Variables={NAME='$AWSUSER'}"
```

7. Invoke the function:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail
```

8. Invoke the function and decode the logs:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail --query 'LogResult' --output text |  base64 -d
```

9. Clean up

```
aws lambda delete-function --function-name my-function-cli-"$AWSUSER"

aws iam delete-role --role-name lambda-ex-"$AWSUSER"
```

</details>

## Level 2 - Tracin' it!

### Steps

1. Paste code
1. Grant DynamoDB permission to function
1. Grant XRay permission to function
1. Test function
1. Check tracing in XRay

## Level 3 - Timin' it!

### Steps

1. Paste code

## Level 4 - No cold starts!

### Steps
