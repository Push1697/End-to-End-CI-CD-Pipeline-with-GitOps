# Technology Stack Justification

## Why AWS EKS (Elastic Kubernetes Service)?

We chose **AWS EKS** over self-managed Kubernetes or other cloud providers for the following reasons:

- **Managed Control Plane**: AWS handles the availability and scalability of the Kubernetes control plane, reducing operational overhead.
- **Integration**: Seamless integration with other AWS services like VPC, IAM, and ECR.
- **Scalability**: Native support for Auto Scaling Groups to handle variable workloads.
- **Standards**: It is a certified Kubernetes conformant, ensuring no vendor lock-in regarding k8s APIs.

## Why Terraform?

We selected **Terraform** for Infrastructure as Code (IaC) because:

- **Cloud Agnostic**: While we are using AWS, Terraform's provider model allows us to extensibility to manage other resources (e.g., Kubernetes, Helm) with the same workflow.
- **State Management**: Terraform's state file helps track resource changes and drift.
- **Modularity**: We can reuse modules (like `terraform-aws-modules/vpc/aws`) to speed up development and follow best practices.

## Why Jenkins?

**Jenkins** was chosen for Continuous Integration due to:

- **Extensibility**: A vast plugin ecosystem (SonarQube, Docker, AWS Credential binding).
- **Control**: Complete control over the build environment and pipeline logic via `Jenkinsfile`.
- **Legacy Compatibility**: It remains the industry standard for many enterprise environments, making it a valuable skill to showcase.

## Why ArgoCD?

For Continuous Deployment, we implemented **GitOps** using **ArgoCD**:

- **Declarative Setup**: The desired state of the application is defined in Git (Kubernetes manifests).
- **Drift Detection**: ArgoCD automatically detects and corrects differences between the live cluster and the Git repository.
- **Security**: No need to store cluster credentials in the CI server (Jenkins). ArgoCD sits inside the cluster and pulls changes.
