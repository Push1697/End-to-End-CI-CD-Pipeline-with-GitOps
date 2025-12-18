# Issues Faced & Troubleshooting

## Issue 1: Terraform State Locking

**Problem**: During `terraform apply`, the specific state file was locked by another process or a failed previous run.
**Fix**:

- Verified no other team member was running Terraform.
- Used `terraform force-unlock <LOCK_ID>` to release the lock manually after confirming it was safe.
- **Prevention**: Configured a backend with S3 and DynamoDB to handle locking more robustly (simulated/planned for production).

## Issue 2: Jenkins Docker Permission Denied

**Problem**: Jenkins build failed with `Got permission denied while trying to connect to the Docker daemon socket`.
**Fix**:

- The Jenkins user was not part of the `docker` group on the host agent.
- Added the user: `sudo usermod -aG docker jenkins`.
- Restarted the Jenkins service to apply group changes.

## Issue 3: ArgoCD Sync Failures due to ImagePath

**Problem**: ArgoCD was not syncing the new image tag because the Kubernetes deployment manifest in the Git repo wasn't updated by the CI pipeline.
**Fix**:

- Added a stage in `Jenkinsfile` to run `git commit` and `git push` back to the manifest repository.
- Configured SSHdeploy keys/Personal Access Tokens to allow Jenkins to write to the repository.

## Issue 4: EKS Node Group Not Joining Cluster

**Problem**: Worker nodes were provisioned but wouldn't join the EKS cluster (Ready status: 0).
**Fix**:

- Investigated `aws-auth` ConfigMap. The node instance role ARN was missing from the `mapRoles` section.
- Updated the Terraform code to ensure the `aws-auth` ConfigMap is correctly populated with the Node Group IAM role.
