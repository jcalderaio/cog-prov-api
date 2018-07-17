# SRC_BUCKET = $2
# SRC_KEY = $1
# LAMBDA_NAME="esante-inform-etl-file-trigger"

# # create a new lambda version
# aws lambda create-function --function-name $LAMBDA_NAME --code "S3Bucket=$SRC_BUCKET,S3Key=$SRC_KEY" --environment "Variables={KeyName1=string,KeyName3=string}"

# aws lambda update-function-configuration --function-name $LAMBDA_NAME --environment "Variables={KeyName1=string,KeyName3=string}"
