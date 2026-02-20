import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

## @params: [JOB_NAME]
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'RAW_BUCKET', 'PROCESSED_BUCKET'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Read raw data from S3
datasource0 = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": ["s3://" + args['RAW_BUCKET'] + "/complaints/"]},
    format="json"
)

# Convert to DataFrame for easier transformation
df = datasource0.toDF()

# Normalize text: lowercasing, stripping whitespace
from pyspark.sql.functions import lower, trim, col

df_normalized = df.withColumn("description", lower(trim(col("description")))) \
                  .withColumn("title", lower(trim(col("title"))))

# Write cleaned data back to S3 Processed bucket
df_normalized.write.mode("append").json("s3://" + args['PROCESSED_BUCKET'] + "/normalized/")

job.commit()
