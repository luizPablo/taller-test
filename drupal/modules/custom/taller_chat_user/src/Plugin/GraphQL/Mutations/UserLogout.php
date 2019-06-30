<?php

namespace Drupal\taller_chat_user\Plugin\GraphQL\Mutations;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\user\UserInterface;
use Drupal\graphql\Plugin\GraphQL\Mutations\MutationPluginBase;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Youshido\GraphQL\Execution\ResolveInfo;

/**
 * Logout User.
 *
 * @GraphQLMutation(
 *   id = "user_logout",
 *   name = "userLogout",
 *   type = "User",
 *   secure = true,
 *   nullable = false,
 *   schema_cache_tags = {"user_logout"},
 *   arguments = {
 *     "name": "String"
 *   }
 * )
 */
class UserLogout extends MutationPluginBase implements ContainerFactoryPluginInterface {
  use DependencySerializationTrait;
  use StringTranslationTrait;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  // @TODO Create a Trait for the user's methods.

  /**
   * The current user service.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    ConfigFactoryInterface $configFactory,
    AccountInterface $currentUser
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->configFactory = $configFactory;
    $this->currentUser = $currentUser;

    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('entity_type.manager'),
      $container->get('config.factory'),
      $container->get('current_user')
    );
  }

  /**
   * Logs out a user.
   *
   * @return \Drupal\user\UserInterface
   *   The newly logged user.
   */
  public function resolve($value, array $args, ResolveInfo $info) {
    return $this->logout(\Drupal::request(), $args);
  }

  /**
   * Logs out a user.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   *
   * @return \Drupal\user\UserInterface
   */
  public function logout(Request $request, $credentials) {
    if (!$this->currentUser->isAuthenticated()) {
      throw new BadRequestHttpException($this->t('The user is not logged in.'));
    }

    $name = $credentials['name'];
    $user = $this->entityTypeManager->getStorage('user')->load($this->currentUser->id());
    
    $this->userLogout();
    return $user;
  }

  protected function userLogout() {
    user_logout();
  }
}
