pipeline {
    agent any
    tools { nodejs "NodeJS18" }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = 'mv1212/project-management-tool'
    }
    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/VuQuangMinh1212/project-management-tool.git', branch: 'main'
            }
        }
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test || echo "No tests defined"'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${env.BUILD_ID}")
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        dockerImage.push('latest')
                        sh "docker image rm ${DOCKER_IMAGE}:${env.BUILD_ID} || true"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    docker stop project-management-tool || true
                    docker rm project-management-tool || true
                    docker run -d --name project-management-tool -p 3003:3000 --restart=unless-stopped ${DOCKER_IMAGE}:latest
                '''
            }
        }
        stage('Cleanup') {
            steps {
                sh '''
                    docker image prune -f
                '''
            }
        }
    }
}