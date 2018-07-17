#!/usr/bin/env groovy

pipeline {
  environment {
		APP_NAME = "esante-attribution-api"
    LAMBDA_FUNCTION_NAME = "arn:aws:lambda:us-east-1:056522482037:function:esante-attribution-api"
    ARTIFACTS_BUCKET = "cgs-artifacts"
		ARTIFACTS_PATH = "esante/inform/esante-attribution-api/"
    BUILD ="./dist"
  }

  agent none

  stages {
    stage('Build') {
      agent any
      steps {
        milestone 1
        sh 'rm -rf ./node_modules package-lock.json'
        sh "echo '//registry.npmjs.org/:_authToken=$NPM_TOKEN' > .npmrc"
        sh 'npm --version'
        sh 'npm install'
        sh "npm run lint"
        // sh "npm run test"
        // update package.json with commit
        script {
          def commit_id = sh (script: 'git rev-parse --short HEAD', returnStdout: true).trim();
          def timestamp = sh (script: 'date +"%Y%m%d_%H%M%S"', returnStdout: true).trim();
          def npmVersion = sh (script: 'cat ./package.json | jq ".version"', returnStdout: true).trim().replace("\"","");
          def publishVersion = "${npmVersion}+${BUILD_NUMBER}";

          sh "echo ${publishVersion} > publish_version.txt"
          stash includes: 'publish_version.txt', name: 'publish_version'
          echo "Build:  number:$BUILD_NUMBER   id:$BUILD_ID"
          // FIX: build number is appended to version. Just replace
          // version with publishVersion above using regex (see clarity web)
          sh "sed -i 's/00000/$BUILD_NUMBER/' ./package.json"
          sh "sed -i 's/local/$commit_id/' ./package.json"
          sh "npm run build"
          def artifact_name = "$APP_NAME.${timestamp}.${commit_id}.zip"
          sh "aws s3 cp $BUILD/lambda.zip s3://${ARTIFACTS_BUCKET}/${ARTIFACTS_PATH}${artifact_name} --no-progress"
          echo "========= $BUILD_NUMBER ===> ${ARTIFACTS_PATH}${artifact_name}"
          sh "echo ${ARTIFACTS_PATH}${artifact_name} > artifact"
          sh "cat ./artifact"
          stash includes: 'artifact', name: 'artifact'
        }
        echo "Build Completed"
      }
    }

stage('Deploy to DEV') {
      agent any
      steps {
        milestone 2
        script {
          unstash 'artifact'
          def artifact = readFile('artifact').trim()
          sh "aws s3 cp s3://cgs-software/terraform/install.sh  ./terraform_install.sh --no-progress && sh terraform_install.sh ./ && chmod +x ./terraform"
          stash includes: 'terraform', name: 'terraform'

          // Modules in TF use git
          sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
            sh "cd ./infrastructure/common && rm -rf .terraform && ../../terraform init"
            sh "cd ./infrastructure/common && ../../terraform apply -no-color -auto-approve -var 'lambda_s3_key=${artifact}'"
          }

          sh 'cd ./infrastructure/common && ../../terraform output lambda_version > ../../lambda_version'
          stash includes: 'lambda_version', name: 'lambda_version'

          sh 'cd ./infrastructure/common && ../../terraform output api_gateway_id > ../../api_gateway_id'
          stash includes: 'api_gateway_id', name: 'api_gateway_id'

          sh 'cd ./infrastructure/common && ../../terraform output lambda_arn > ../../lambda_arn'
          stash includes: 'lambda_arn', name: 'lambda_arn'

          // deploying to DEV
          def env = "dev"
          def lambda_version = readFile('lambda_version').trim()
          def api_gateway_id = readFile('api_gateway_id').trim()
          def lambda_arn = readFile('lambda_arn').trim()

          echo "Deploying lambda version ${lambda_version} to ${env} [${artifact}]"
          sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
            sh "cd ./infrastructure/environment && rm -rf .terraform && ../../terraform init"
            sh "cd ./infrastructure/environment && ../../terraform workspace select ${env} || ../../terraform workspace new ${env}"
            sh "cd ./infrastructure/environment && ../../terraform apply -no-color -auto-approve -var 'api_gateway_id=${api_gateway_id}' -var 'lambda_arn=${lambda_arn}' -var 'lambda_version=${lambda_version}'"
          }
          echo "Deploy to [${env}] completed"
        }
      }
    }
    stage('Confirm Deploy to QA') {
      agent none
      steps {
        timeout(time: 12, unit: 'HOURS') {
          input 'Deploy to QA?'
        }
      }
    }

stage('Deploy to QA') {
      agent any
      steps {
        milestone 3
        script {
          def env = "qa"
          unstash 'artifact'
          def artifact = readFile('artifact').trim()

          unstash 'lambda_version'
          def lambda_version = readFile('lambda_version').trim()
          unstash 'api_gateway_id'
          def api_gateway_id = readFile('api_gateway_id').trim()
          unstash 'lambda_arn'
          def lambda_arn = readFile('lambda_arn').trim()

          echo "Deploying lambda version ${lambda_version} to ${env}"
          unstash 'terraform'

          sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
            sh "cd ./infrastructure/environment && rm -rf .terraform && ../../terraform init"
            sh "cd ./infrastructure/environment && ../../terraform workspace select ${env} || ../../terraform workspace new ${env}"
            sh "cd ./infrastructure/environment && ../../terraform apply -no-color -auto-approve -var 'api_gateway_id=${api_gateway_id}' -var 'lambda_arn=${lambda_arn}' -var 'lambda_version=${lambda_version}'"
          }
          echo "Deploy to [${env}] completed"
        }
      }
    }

    stage('Confirm STAGE') {
      agent none
      steps {
        timeout(time: 12, unit: 'HOURS') {
          input 'Deploy to STAGE?'
        }
      }
    }

    stage('Tag build in Git'){
      agent any
      steps {
        milestone 4
        unstash 'publish_version'
        script {
          def publishVersion = readFile('publish_version.txt').trim();
          sh "git tag ${publishVersion}"
          sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
            sh "git push origin ${publishVersion}"
          }
        }
      }
    }

    stage('Deploy to STAGE') {
      agent any
      steps {
        milestone 5
        script {
          def env = "stage"
          unstash 'artifact'
          def artifact = readFile('artifact').trim()

          unstash 'lambda_version'
          def lambda_version = readFile('lambda_version').trim()
          unstash 'api_gateway_id'
          def api_gateway_id = readFile('api_gateway_id').trim()
          unstash 'lambda_arn'
          def lambda_arn = readFile('lambda_arn').trim()

          echo "Deploying lambda version ${lambda_version} to ${env}"
          unstash 'terraform'

          sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
            sh "cd ./infrastructure/environment && rm -rf .terraform && ../../terraform init"
            sh "cd ./infrastructure/environment && ../../terraform workspace select ${env} || ../../terraform workspace new ${env}"
            sh "cd ./infrastructure/environment && ../../terraform apply -no-color -auto-approve -var 'api_gateway_id=${api_gateway_id}' -var 'lambda_arn=${lambda_arn}' -var 'lambda_version=${lambda_version}'"
          }
          echo "Deploy to [${env}] completed"
        }
      }
    }
  }
}
